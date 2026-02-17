import { NextRequest } from "next/server";

// ElevenLabs voice IDs — premade voices
const VOICE_ID = "IKne3meq5aSn9XLyUdCD"; // "Charlie" — casual, conversational

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15; // max TTS requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (isRateLimited(ip)) {
            return new Response(
                JSON.stringify({ error: "Too many voice requests. Please wait a moment." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const { text } = await req.json();

        if (!text || typeof text !== "string") {
            return new Response(
                JSON.stringify({ error: "Text is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Cap text length to control costs
        const trimmedText = text.slice(0, 2000);

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "ElevenLabs API key not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                    text: trimmedText,
                    model_id: "eleven_flash_v2_5",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.0,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs API error:", response.status, errorText);
            return new Response(
                JSON.stringify({ error: "Voice generation failed" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Stream the audio directly to client — no buffering wait
        return new Response(response.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("TTS API error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
