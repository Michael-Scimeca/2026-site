import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { KNOWLEDGE_BASE, SYSTEM_PROMPT } from "@/lib/knowledge-base";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// --- Abuse prevention ---
const MAX_MESSAGE_LENGTH = 500;       // characters per message
const MAX_CONVERSATION_LENGTH = 20;   // messages per session
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 30;            // max requests per window

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
        // Rate limit by IP
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (isRateLimited(ip)) {
            return new Response(
                JSON.stringify({ error: "You've sent too many messages. Please try again in a few minutes." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const { messages } = (await req.json()) as { messages: ChatMessage[] };

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Messages array is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Cap conversation length
        if (messages.length > MAX_CONVERSATION_LENGTH) {
            return new Response(
                JSON.stringify({ error: "Conversation limit reached. Please refresh to start a new chat." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Cap message length
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.content.length > MAX_MESSAGE_LENGTH) {
            return new Response(
                JSON.stringify({ error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.` }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const systemPrompt = `${SYSTEM_PROMPT}\n\nHere is Michael's knowledge base that you should reference when answering questions:\n\n${KNOWLEDGE_BASE}`;

        const stream = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 512,
            system: systemPrompt,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        });

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of stream) {
                        if (
                            event.type === "content_block_delta" &&
                            event.delta.type === "text_delta"
                        ) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                            );
                        }
                    }
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error: unknown) {
        console.error("Chat API error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
