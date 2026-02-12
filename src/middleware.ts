import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash credentials are provided
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
let ratelimit: Ratelimit | null = null;

if (upstashUrl && upstashToken) {
    const redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
    });

    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
    });
}

export async function middleware(request: NextRequest) {
    // Only apply to /api/game-stats
    if (request.nextUrl.pathname.startsWith("/api/game-stats")) {

        // Allow GET requests without strict limits (or higher limits), 
        // but strictly limit POST (writes)
        if (request.method === "POST") {
            if (!ratelimit) {
                console.warn("Rate limiting is not set up: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
                return NextResponse.next();
            }

            // Use IP as identifier (with fallback to headers)
            const ip =
                (request as any).ip ??
                request.headers.get("x-forwarded-for")?.split(",")[0] ??
                request.headers.get("x-real-ip") ??
                "127.0.0.1";

            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests" },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    }
                );
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/game-stats/:path*",
};
