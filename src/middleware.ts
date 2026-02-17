import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash credentials are provided
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create rate limiters with different tiers
let gameRateLimit: Ratelimit | null = null;
let apiRateLimit: Ratelimit | null = null;

if (upstashUrl && upstashToken) {
    const redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
    });

    // Game stats: 10 requests per 10 seconds
    gameRateLimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "rl:game",
    });

    // General API: 30 requests per minute
    apiRateLimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "60 s"),
        analytics: true,
        prefix: "rl:api",
    });
}

// Security headers applied to all responses
const securityHeaders: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

function getIp(request: NextRequest): string {
    return (
        (request as any).ip ??
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "127.0.0.1"
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Rate limit: /api/game-stats POST ---
    if (pathname.startsWith("/api/game-stats") && request.method === "POST") {
        if (gameRateLimit) {
            const ip = getIp(request);
            const { success, limit, reset, remaining } = await gameRateLimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests" },
                    {
                        status: 429,
                        headers: {
                            ...securityHeaders,
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    }
                );
            }
        }
    }

    // --- Rate limit: /api/chat, /api/sms, /api/schedule, /api/chat/contact POST ---
    const rateLimitedPaths = ["/api/chat", "/api/sms", "/api/schedule", "/api/chat/contact", "/api/unknown-question"];
    if (request.method === "POST" && rateLimitedPaths.some((p) => pathname === p)) {
        if (apiRateLimit) {
            const ip = getIp(request);
            const { success, limit, reset, remaining } = await apiRateLimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please try again later." },
                    {
                        status: 429,
                        headers: {
                            ...securityHeaders,
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    }
                );
            }
        }
    }

    // Apply security headers to all responses
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}

export const config = {
    matcher: [
        // Match all routes except static files and _next internals
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico)).*)",
    ],
};
