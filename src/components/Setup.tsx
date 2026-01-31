"use client";

import { Container } from "@/components/Container";
import Image from "next/image";

interface SetupItem {
    id: string;
    company: string;
    description: string;
    logo?: string;
}

const setupItems: SetupItem[] = [
    {
        id: "optimum-nutrition",
        company: "Optimum Nutrition",
        description: "Engineered for performance. Partnering on technical innovation and global digital expansion.",
        logo: "/logos/on-logo-white.svg"
    },
    {
        id: "optimo",
        company: "Optimo",
        description: "Strategic creative development and visual identity for contemporary lifestyle brands.",
        logo: "/logos/logo-hat.png"
    },
    {
        id: "68ventures",
        company: "68 Ventures",
        description: "Leading the next wave of strategic investments in high-growth technology sectors.",
        logo: "/logos/78venatures.png"
    },
    {
        id: "flipboard",
        company: "Flipboard",
        description: "Katy Perry, Nas, and Jason Derulo are investing big in a Spotify rival.",
        logo: "/logos/flipboard-logo.png"
    },
    {
        id: "nether-realm",
        company: "Nether Realm",
        description: "Pushing the boundaries of immersive digital experiences and interactive storytelling.",
        logo: "/logos/nether.png"
    },
    {
        id: "snickers",
        company: "Snickers",
        description: "Defining a new era of consumer engagement through innovative digital-first campaigns.",
        logo: "/logos/snickers.png"
    },
    {
        id: "nycpride",
        company: "NYC Pride",
        description: "TinyFish AI agent raises $47 million.",
        logo: "/logos/nycpride.png"
    },
    {
        id: "seiu",
        company: "SEIU",
        description: "NeoReach helps 10,000+ creators earn more than $50 million.",
        logo: "/logos/seiu.png"
    },
    {
        id: "foo",
        company: "Foosackly's",
        description: "Everest emerges from stealth mode with a landmark $140 million funding.",
        logo: "/logos/foo.png"
    },
    {
        id: "armadillo",
        company: "Armadillo",
        description: "Distributed ventures leads Armadillo’s to a $3.5 million seed round.",
    },
    {
        id: "cognito",
        company: "Cognito",
        description: "Plaid Scoops up Cognito for $250 million.",
    },
    {
        id: "new-engen",
        company: "New Engen",
        description: "New Engen ranks top 5 among large agencies on ADWEEK's 2025 fastest growing agencies list.",
    },
    {
        id: "halborn",
        company: "Halborn",
        description: "Blockchain security startup raises $90 million despite crypto winter.",
    }
];

function SetupRow({ item }: { item: SetupItem }) {
    return (
        <div className="group border-b border-zinc-800 w-full transition-colors hover:bg-zinc-900 py-10 md:py-14">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-12 items-center">
                    {/* Left: Logo & Company Name */}
                    <div className="flex items-center gap-6">
                        {item.logo && (
                            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                <img
                                    src={`${item.logo}?v=2`}
                                    alt={`${item.company} Logo`}
                                    className="w-28 h-28 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                />
                            </div>
                        )}
                        <h3 className="font-extrabold text-2xl md:text-3xl tracking-tighter text-white">
                            {item.company}
                        </h3>
                    </div>

                    {/* Right: Description */}
                    <div className="flex items-center">
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export function Setup() {
    return (
        <section className="bg-black text-white  border-t border-zinc-800">
            <div className="flex flex-col">
                {setupItems.map((item) => (
                    <SetupRow key={item.id} item={item} />
                ))}
                {/* Final bottom border logic if needed, but the list ends with a border-b on rows */}
            </div>
        </section>
    );
}
