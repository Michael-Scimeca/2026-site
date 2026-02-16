import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getVisitor, saveVisitor, type VisitorData } from "@/lib/visitor-store";

const COOKIE_NAME = "chat_visitor_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// GET — retrieve visitor data from cookie ID
export async function GET(req: NextRequest) {
    try {
        const visitorId = req.cookies.get(COOKIE_NAME)?.value;

        if (!visitorId) {
            return NextResponse.json({ visitor: null, isNew: true });
        }

        const visitor = await getVisitor(visitorId);

        if (!visitor) {
            return NextResponse.json({ visitor: null, isNew: true });
        }

        // Update visit count and last visit
        visitor.visitCount += 1;
        visitor.lastVisit = new Date().toISOString();
        await saveVisitor(visitor);

        return NextResponse.json({ visitor, isNew: false });
    } catch (error) {
        console.error("Visitor GET error:", error);
        return NextResponse.json({ visitor: null, isNew: true });
    }
}

// POST — create or update visitor data
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, action } = body as {
            name?: string;
            email?: string;
            action?: "identify" | "contact_submitted" | "log_conversation";
            firstMessage?: string;
            messageCount?: number;
        };

        // Get or create visitor ID
        let visitorId = req.cookies.get(COOKIE_NAME)?.value;
        let isNew = false;

        if (!visitorId) {
            visitorId = uuidv4();
            isNew = true;
        }

        // Get existing visitor data or create new
        let visitor = await getVisitor(visitorId);

        if (!visitor) {
            visitor = {
                id: visitorId,
                name: name || "",
                email: email || "",
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString(),
                visitCount: 1,
                contactSubmissions: 0,
                conversations: [],
            };
            isNew = true;
        }

        // Update based on action
        if (action === "identify" || !action) {
            if (name) visitor.name = name;
            if (email) visitor.email = email;
            visitor.lastVisit = new Date().toISOString();
        } else if (action === "contact_submitted") {
            visitor.contactSubmissions += 1;
            visitor.lastVisit = new Date().toISOString();
        } else if (action === "log_conversation") {
            const { firstMessage, messageCount } = body;
            if (firstMessage) {
                visitor.conversations = [
                    {
                        timestamp: new Date().toISOString(),
                        firstMessage: String(firstMessage).slice(0, 200),
                        messageCount: messageCount || 1,
                    },
                    ...visitor.conversations,
                ].slice(0, 20);
            }
        }

        await saveVisitor(visitor);

        // Set cookie in response
        const response = NextResponse.json({ visitor, isNew });

        response.cookies.set(COOKIE_NAME, visitorId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Visitor POST error:", error);
        return NextResponse.json(
            { error: "Failed to save visitor data" },
            { status: 500 }
        );
    }
}
