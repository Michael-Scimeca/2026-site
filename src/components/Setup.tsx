"use client";

import { Container } from "@/components/Container";
import Image from "next/image";

interface SetupItem {
    id: string;
    company: string;
    description: string;
    logo?: string;
    tools?: string[];
    themeColor?: string;
}

const setupItems: SetupItem[] = [
    {
        id: "optimum-nutrition",
        company: "Optimum Nutrition",
        description: "Engineered for performance. Partnering on technical innovation and global digital expansion.",
        logo: "/logos/on.png",
        tools: ["Next.js", "GSAP", "Three.js", "Tailwind CSS", "Sanity"],
        themeColor: "#0158ff" // Blue
    },
    {
        id: "68ventures",
        company: "68 Ventures",
        description: "Leading the next wave of strategic investments in high-growth technology sectors.",
        logo: "/logos/78venatures.png",
        tools: ["React", "TypeScript", "Framer Motion", "Node.js"],
        themeColor: "#a855f7" // Purple
    },
    {
        id: "flipboard",
        company: "Flipboard",
        description: "Katy Perry, Nas, and Jason Derulo are investing big in a Spotify rival.",
        logo: "/logos/flipboard-logo.png",
        tools: ["Native iOS", "Swift", "Core Animation"],
        themeColor: "#ef4444" // Red
    },
    {
        id: "snickers",
        company: "Snickers",
        description: "Defining a new era of consumer engagement through innovative digital-first campaigns.",
        logo: "/logos/snickers.png",
        tools: ["Vue.js", "Web Audio API", "Canvas"],
        themeColor: "#10b981" // Emerald
    },
    {
        id: "nycpride",
        company: "NYC Pride",
        description: "TinyFish AI agent raises $47 million.",
        logo: "/logos/nycpride.png",
        tools: ["Next.js", "AI Agents", "Python"],
        themeColor: "#f59e0b" // Amber
    },
    {
        id: "seiu",
        company: "SEIU",
        description: "NeoReach helps 10,000+ creators earn more than $50 million.",
        logo: "/logos/seiu.png",
        tools: ["React", "GraphQL", "Ruby on Rails"],
        themeColor: "#3b82f6" // Bright Blue
    },
    {
        id: "foo",
        company: "Foosackly's",
        description: "Everest emerges from stealth mode with a landmark $140 million funding.",
        logo: "/logos/foo.png",
        tools: ["Svelte", "PostgreSQL", "Cloudflare"],
        themeColor: "#06b6d4" // Cyan
    },
    {
        id: "gabbanelli",
        company: "Gabbanelli",
        description: "A legendary legacy in craftsmanship, redefining luxury and tradition through music.",
        logo: "/logos/gab.png",
        tools: ["E-Commerce", "Shopify", "Liquid"],
        themeColor: "#8b5cf6" // Violet
    },
    {
        id: "nether-realm",
        company: "Nether Realm",
        description: "Pushing the boundaries of immersive digital experiences and interactive storytelling.",
        logo: "/logos/nether.png",
        tools: ["Photoshop"],
        themeColor: "#ec4899" // Pink
    },
    {
        id: "optimo",
        company: "Optimo",
        description: "Strategic creative development and visual identity for contemporary lifestyle brands.",
        logo: "/logos/logo-hat.png",
        tools: ["Photoshop"],
        themeColor: "#14b8a6" // Teal
    },
];

function SetupRow({ item }: { item: SetupItem }) {
    return (
        <div className="group border-b border-zinc-800 w-full transition-colors relative py-8 desktop:py-0 overflow-hidden">
            {/* Dynamic Background Hover Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${item.themeColor || '#0158ff'} 0%, transparent 70%)`
                }}
            />

            <Container className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 md:gap-x-12 items-center">
                    {/* Left: Logo & Company Name */}
                    <div className="flex items-center md:col-span-1">
                        {item.logo && (
                            <div className="relative w-20 h-10 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center">
                                <img
                                    src={`${item.logo}?v=2`}
                                    alt={`${item.company} Logo`}
                                    loading="lazy"
                                    className="w-full h-full object-contain brightness-0 invert opacity-100 transition-opacity duration-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right: Description & Tools */}
                    <div className="flex flex-col justify-center md:col-span-3">
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-2">
                            {item.description}
                        </p>

                        {item.tools && item.tools.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                {item.tools.map((tool, index) => (
                                    <div key={tool} className="flex items-center gap-x-3">
                                        {index !== 0 && (
                                            <span
                                                className="text-[10px] font-bold"
                                                style={{ color: item.themeColor || '#0158ff' }}
                                            >
                                                ⌁
                                            </span>
                                        )}
                                        <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                                            {tool}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export function Setup() {
    return (
        <section className="bg-black text-white border-t border-zinc-800">
            <div className="flex flex-col">
                {setupItems.map((item) => (
                    <SetupRow key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
