"use client";

import { Container } from "@/components/Container";

interface SetupItem {
    id: string;
    company: string;
    description: string;
}

const setupItems: SetupItem[] = [
    {
        id: "armadillo",
        company: "Armadillo",
        description: "Distributed ventures leads Armadillo’s to a $3.5 million seed round."
    },
    {
        id: "cognito",
        company: "Cognito",
        description: "Plaid Scoops up Cognito for $250 million."
    },
    {
        id: "new-engen",
        company: "New Engen",
        description: "New Engen ranks top 5 among large agencies on ADWEEK's 2025 fastest growing agencies list."
    },
    {
        id: "halborn",
        company: "Halborn",
        description: "Blockchain security startup raises $90 million despite drypto winter."
    },
    {
        id: "audius",
        company: "Audius",
        description: "Katy Perry, Nas, and Jason Derulo are investing big in a Spotify rival."
    },
    {
        id: "tinyfish",
        company: "TinyFish",
        description: "TinyFish AI agent raises $47 million."
    },
    {
        id: "neoreach",
        company: "NeoReach",
        description: "NeoReach helps 10,000+ creators earn more than $50 million."
    },
    {
        id: "everest",
        company: "Everest",
        description: "Everest emerges from stealth mode with a landmark $140 million funding."
    }
];

function SetupRow({ item }: { item: SetupItem }) {
    return (
        <div className="group border-b border-zinc-200 w-full transition-colors hover:bg-zinc-50/50 py-8 md:py-10">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-12 items-center">
                    {/* Left: Company Name (Logo placeholder) */}
                    <div className="flex items-center">
                        <h3 className="font-extrabold text-xl md:text-2xl tracking-tight text-zinc-900">
                            {item.company}
                        </h3>
                    </div>

                    {/* Right: Description */}
                    <div className="flex items-center">
                        <p className="text-zinc-600 text-base md:text-lg font-medium leading-relaxed">
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
        <section className="bg-zinc-100/50 text-zinc-900 border-t border-zinc-200">
            <div className="flex flex-col">
                {setupItems.map((item) => (
                    <SetupRow key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
