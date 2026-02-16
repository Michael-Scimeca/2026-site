import { NextRequest, NextResponse } from "next/server";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "michael-scimeca-portfolio";

export async function POST(req: NextRequest) {
    try {
        const { name, phone, message } = await req.json();

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
