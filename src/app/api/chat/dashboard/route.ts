import { NextResponse } from "next/server";
import { getAllVisitors } from "@/lib/visitor-store";

// Simple auth check — use a secret key in production
function isAuthorized(req: Request): boolean {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    // Use env var for the dashboard key, fallback for dev
    const dashboardKey = process.env.DASHBOARD_KEY || "mikey2026";
    return key === dashboardKey;
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const visitors = await getAllVisitors();

        const stats = {
            totalVisitors: visitors.length,
            totalConversations: visitors.reduce((sum, v) => sum + (v.conversations?.length || 0), 0),
            totalContactSubmissions: visitors.reduce((sum, v) => sum + (v.contactSubmissions || 0), 0),
            returningVisitors: visitors.filter((v) => v.visitCount > 1).length,
            storage: "Sanity CMS",
            visitors: visitors.map((v) => ({
                id: v.id?.slice(0, 8) + "...",
                name: v.name || "(anonymous)",
                email: v.email || "(none)",
                firstVisit: v.firstVisit,
                lastVisit: v.lastVisit,
                visitCount: v.visitCount,
                contactSubmissions: v.contactSubmissions,
                conversations: (v.conversations || []).slice(0, 5),
            })),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
