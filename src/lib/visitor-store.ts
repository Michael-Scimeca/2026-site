import { serverClient } from "@/sanity/lib/server-client";

// Visitor data stored in Sanity
export interface VisitorData {
    _id?: string;
    id: string;
    name: string;
    email: string;
    firstVisit: string;
    lastVisit: string;
    visitCount: number;
    contactSubmissions: number;
    conversations: ConversationSummary[];
}

export interface ConversationSummary {
    _key?: string;
    timestamp: string;
    firstMessage: string;
    messageCount: number;
}

// Get a visitor by their cookie ID
export async function getVisitor(visitorId: string): Promise<VisitorData | null> {
    try {
        const result = await serverClient.fetch(
            `*[_type == "chatVisitor" && visitorId == $visitorId][0]{
        _id,
        "id": visitorId,
        name,
        email,
        firstVisit,
        lastVisit,
        visitCount,
        contactSubmissions,
        conversations[]{ _key, timestamp, firstMessage, messageCount }
      }`,
            { visitorId }
        );
        return result || null;
    } catch (error) {
        console.error("Sanity getVisitor error:", error);
        return null;
    }
}

// Save or update a visitor
export async function saveVisitor(visitor: VisitorData): Promise<void> {
    try {
        if (visitor._id) {
            // Update existing document
            await serverClient
                .patch(visitor._id)
                .set({
                    name: visitor.name,
                    email: visitor.email,
                    lastVisit: visitor.lastVisit,
                    visitCount: visitor.visitCount,
                    contactSubmissions: visitor.contactSubmissions,
                    conversations: visitor.conversations.map((c, i) => ({
                        _key: c._key || `conv_${i}_${Date.now()}`,
                        timestamp: c.timestamp,
                        firstMessage: c.firstMessage,
                        messageCount: c.messageCount,
                    })),
                })
                .commit();
        } else {
            // Create new document
            await serverClient.create({
                _type: "chatVisitor",
                visitorId: visitor.id,
                name: visitor.name,
                email: visitor.email,
                firstVisit: visitor.firstVisit,
                lastVisit: visitor.lastVisit,
                visitCount: visitor.visitCount,
                contactSubmissions: visitor.contactSubmissions,
                conversations: visitor.conversations.map((c, i) => ({
                    _key: c._key || `conv_${i}_${Date.now()}`,
                    timestamp: c.timestamp,
                    firstMessage: c.firstMessage,
                    messageCount: c.messageCount,
                })),
            });
        }
    } catch (error) {
        console.error("Sanity saveVisitor error:", error);
    }
}

// Get all visitors (for analytics/dashboard)
export async function getAllVisitors(): Promise<VisitorData[]> {
    try {
        const results = await serverClient.fetch(
            `*[_type == "chatVisitor"] | order(lastVisit desc) {
        _id,
        "id": visitorId,
        name,
        email,
        firstVisit,
        lastVisit,
        visitCount,
        contactSubmissions,
        conversations[]{ _key, timestamp, firstMessage, messageCount }
      }`
        );
        return results || [];
    } catch (error) {
        console.error("Sanity getAllVisitors error:", error);
        return [];
    }
}
