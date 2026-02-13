import { NextResponse } from 'next/server';
import { Resend } from 'resend';


let _resend: Resend | null = null;
function getResend() {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; // Optional: set in .env for n8n integration

// Simple in-memory rate limiting (per IP, 5 requests per hour)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (entry.count >= RATE_LIMIT) {
        return false;
    }

    entry.count++;
    return true;
}

// Sanitize user input for safe HTML embedding
function sanitizeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Enforce length limits on input
function sanitizeField(value: string | undefined, maxLength: number): string {
    return sanitizeHtml(String(value || '').trim().slice(0, maxLength));
}

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { name: rawName, email: rawEmail, company: rawCompany, budget: rawBudget, date: rawDate, time: rawTime, description: rawDescription } = body;

        // Sanitize all inputs
        const name = sanitizeField(rawName, 100);
        const email = sanitizeField(rawEmail, 150);
        const company = sanitizeField(rawCompany, 150);
        const budget = sanitizeField(rawBudget, 50);
        const date = sanitizeField(rawDate, 20);
        const time = sanitizeField(rawTime, 20);
        const description = sanitizeField(rawDescription, 1000);

        // Server-side validation
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Missing required fields: name and email are required.' },
                { status: 400 }
            );
        }

        // Basic email validation (use raw input for regex, sanitized for display)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(rawEmail).trim())) {
            return NextResponse.json(
                { error: 'Invalid email address.' },
                { status: 400 }
            );
        }

        // Clean email for sending (not HTML-escaped)
        const cleanEmail = String(rawEmail).trim().slice(0, 150);

        // If date/time are present, it's a full booking (legacy/future support)
        const isFullBooking = date && time;
        let formattedDate = '';

        if (isFullBooking) {
            const meetingDate = new Date(String(rawDate).trim() + 'T12:00:00');
            formattedDate = meetingDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Forward to n8n webhook if configured (only for full bookings or extensive data)
        if (N8N_WEBHOOK_URL && isFullBooking) {
            fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    company: company || 'Not specified',
                    budget: budget || 'Not specified',
                    date,
                    time,
                    description: description || 'No description provided',
                    timezone: 'America/Chicago',
                    submittedAt: new Date().toISOString(),
                }),
            }).catch(err => console.error('n8n webhook error:', err));
        }

        // Send notification email to you (Simpler Lead Notification)
        const { error: emailError } = await getResend().emails.send({
            from: 'Michael Scimeca <onboarding@resend.dev>',
            to: ['mikeyscimeca@gmail.com'],
            subject: isFullBooking
                ? `🗓️ New Discovery Call: ${name}`
                : `🚀 New Strategy Lead: ${name}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
                    <div style="height: 4px; background: linear-gradient(to right, #0158ff, #6500ff, #0158ff);"></div>
                    <div style="padding: 32px;">
                        <h1 style="font-size: 24px; margin: 0 0 24px 0; color: #fff;">
                            ${isFullBooking ? 'New Discovery Call Booked 🎉' : 'New Strategy Interest 🚀'}
                        </h1>
                        
                        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Name</td>
                                    <td style="padding: 8px 0; color: #fff; font-weight: 600;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td>
                                    <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0158ff;">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Budget</td>
                                    <td style="padding: 8px 0; color: #0158ff; font-weight: 600;">${budget || 'Not specified'}</td>
                                </tr>
                                ${isFullBooking ? `
                                <tr>
                                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td>
                                    <td style="padding: 8px 0; color: #fff;">${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td>
                                    <td style="padding: 8px 0; color: #fff;">${time} CT</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>
                    </div>
                </div>
            `,
        });

        if (emailError) {
            console.error('Resend email error:', emailError);
            return NextResponse.json({ error: 'Failed to send notification.' }, { status: 500 });
        }

        // Send confirmation email to the User
        if (isFullBooking) {
            await getResend().emails.send({
                from: 'Michael Scimeca <onboarding@resend.dev>',
                to: [cleanEmail],
                subject: 'Discovery Call Confirmed! 🎉',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
                        <div style="height: 4px; background: linear-gradient(to right, #0158ff, #6500ff, #0158ff);"></div>
                        <div style="padding: 32px;">
                            <h1 style="font-size: 24px; margin: 0 0 24px 0; color: #fff;">
                                Strategy Call Confirmed ✅
                            </h1>
                            <p style="color: #ccc; line-height: 1.6;">
                                Hi ${name.split(' ')[0]},<br><br>
                                Thanks for booking a time. I'm looking forward to our chat on <strong>${formattedDate} at ${time} CT</strong>.
                            </p>
                            <p style="color: #ccc; line-height: 1.6;">
                                You should receive a Google Calendar invite shortly (via my automation system).
                            </p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #888; font-size: 14px;">
                                Michael Scimeca<br>
                                <a href="https://michaelscimeca.com" style="color: #0158ff; text-decoration: none;">michaelscimeca.com</a>
                            </div>
                        </div>
                    </div>
                `,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Lead captured',
            redirectToCalendar: !isFullBooking
        });
    } catch (error) {
        console.error('Schedule API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
