import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "michael-scimeca-portfolio";

let _resend: Resend | null = null;
function getResend() {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

export async function POST(req: NextRequest) {
    try {
        const { question, type = "unknown" } = await req.json();

        if (!question) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 }
            );
        }

        const isFeatureRequest = type === "feature_request";
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

        // --- ntfy push notification ---
        const ntfyTitle = isFeatureRequest
            ? "Nash Feature Request"
            : "Nash Knowledge Gap";
        const ntfyTags = isFeatureRequest
            ? "bulb,sparkles"
            : "question,brain";
        const ntfyMessage = isFeatureRequest
            ? `A visitor asked about a service you don't currently list:\n\n"${question}"\n\nThis could be a new business opportunity — consider adding it or following up.`
            : `A visitor asked a question Nash couldn't answer:\n\n"${question}"\n\nConsider adding this info to the knowledge base.`;

        const ntfyPromise = fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: "POST",
            headers: {
                "Title": ntfyTitle,
                "Priority": isFeatureRequest ? "high" : "default",
                "Tags": ntfyTags,
            },
            body: ntfyMessage,
        }).catch((err) => console.error("ntfy error:", err));

        // --- Email notification via Resend ---
        let emailPromise: Promise<unknown> = Promise.resolve();

        if (process.env.RESEND_API_KEY) {
            const emailSubject = isFeatureRequest
                ? `💡 Feature Request from a visitor: "${question.slice(0, 60)}${question.length > 60 ? "..." : ""}"`
                : `❓ Nash couldn't answer: "${question.slice(0, 60)}${question.length > 60 ? "..." : ""}"`;

            const emailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0a0a0c; color: #ffffff; border-radius: 16px;">
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
                        <h2 style="margin: 0; color: ${isFeatureRequest ? "#f59e0b" : "#0158ff"}; font-size: 20px;">
                            ${isFeatureRequest ? "💡 New Feature Request" : "❓ Knowledge Gap Detected"}
                        </h2>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.5); font-size: 13px;">
                            ${isFeatureRequest
                    ? "A visitor asked about a service or capability not in your current offerings"
                    : "A visitor asked something Nash couldn't answer from the knowledge base"}
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                            ${isFeatureRequest ? "Service Requested" : "Question Asked"}
                        </p>
                        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 10px; margin-top: 4px; border-left: 3px solid ${isFeatureRequest ? "#f59e0b" : "#0158ff"};">
                            <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9); font-style: italic;">"${question}"</p>
                        </div>
                    </div>

                    ${isFeatureRequest ? `
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Suggested Action</p>
                        <div style="background: rgba(245, 158, 11, 0.08); padding: 12px 16px; border-radius: 10px; margin-top: 4px;">
                            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">Consider whether to add this as a service, update the knowledge base, or follow up with the visitor directly.</p>
                        </div>
                    </div>
                    ` : `
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Suggested Action</p>
                        <div style="background: rgba(1, 88, 255, 0.08); padding: 12px 16px; border-radius: 10px; margin-top: 4px;">
                            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">Add the answer to the knowledge base in <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 13px;">src/lib/knowledge-base.ts</code> so Nash can answer this next time.</p>
                        </div>
                    </div>
                    `}
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px;">
                        <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px;">Sent via Nash on michaelscimeca.com • ${timestamp}</p>
                    </div>
                </div>
            `;

            emailPromise = getResend().emails.send({
                from: "Nash AI <onboarding@resend.dev>",
                to: "mikeyscimeca@gmail.com",
                subject: emailSubject,
                html: emailHtml,
            }).catch((err) => console.error("Resend email error:", err));
        }

        // Wait for both to complete
        await Promise.allSettled([ntfyPromise, emailPromise]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unknown question route error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
