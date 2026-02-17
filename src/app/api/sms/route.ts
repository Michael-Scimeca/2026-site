import { NextRequest, NextResponse } from "next/server";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "michael-scimeca-portfolio";

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
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

// Sanitize user input
function sanitize(str: string, maxLen: number): string {
    return String(str || '').trim().slice(0, maxLen)
        .replace(/</g, '').replace(/>/g, '');
}

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const name = sanitize(body.name, 100);
        const phone = sanitize(body.phone, 20);
        const message = sanitize(body.message, 500);

        if (!name || !message) {
            return NextResponse.json(
                { error: "Name and message are required" },
                { status: 400 }
            );
        }

        const ntfyMessage = `From: ${name}\nPhone: ${phone || "Not provided"}\n\n${message}`;

        const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: "POST",
            headers: {
                "Title": `New text from ${name}`,
                "Priority": "high",
                "Tags": "iphone,speech_balloon",
            },
            body: ntfyMessage,
        });

        if (!res.ok) {
            console.error("ntfy error:", await res.text());
            return NextResponse.json(
                { error: "Failed to send notification" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("SMS route error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
