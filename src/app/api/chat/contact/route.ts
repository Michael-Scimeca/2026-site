import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface ContactPayload {
  name: string;
  email: string;
  budget: string;
  timeline: string;
  startDate: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, budget, timeline, startDate } =
      (await req.json()) as ContactPayload;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Send notification email to Michael
    const { error: emailError } = await getResend().emails.send({
      from: "Chatbot Lead <onboarding@resend.dev>",
      to: "mikeyscimeca@gmail.com",
      subject: `💬 New project inquiry from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0a0a0c; color: #ffffff; border-radius: 16px;">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #0158ff; font-size: 20px;">New Project Inquiry</h2>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.5); font-size: 13px;">Someone is interested in working with you — submitted via chatbot</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
            <p style="margin: 0; font-size: 16px; color: #ffffff;">${name}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
            <p style="margin: 0; font-size: 16px;"><a href="mailto:${email}" style="color: #0158ff; text-decoration: none;">${email}</a></p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">💰 Budget</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 10px; margin-top: 4px;">
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">${budget || "Not specified"}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">⏱️ Timeline</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 10px; margin-top: 4px;">
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">${timeline || "Not specified"}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">📅 Start Date</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 10px; margin-top: 4px;">
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">${startDate || "Not specified"}</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px;">
            <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px;">Sent via chatbot on michaelscimeca.com • ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Contact API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
