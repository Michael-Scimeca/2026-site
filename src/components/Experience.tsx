"use client";

import { Container } from "@/components/Container";
import Image from "next/image";
import { useRef } from "react";

interface ExperienceItem {
    _key: string;
    company: string;
    role: string;
    dateRange: string;
    description: any[];
    creditLabel?: string;
    creditLinks?: string;
    thumbnail?: string;
    tools?: string[];
}

interface ExperienceProps {
    items: ExperienceItem[];
}

function ExperienceRow({ item }: { item: ExperienceItem }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch((e) => console.log("Play error:", e));
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <div
            className="group border-t border-zinc-200 w-full transition-colors hover:bg-zinc-50/50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-16 gap-y-6 md:gap-x-6 items-center">
                    {/* Column 1: Company & Role (3 cols) */}
                    <div className="md:col-span-3 flex flex-col gap-1">
                        <h3 className="font-bold text-lg md:text-xl tracking-tight">
                            {item.company}
                        </h3>
                        <p className="text-zinc-600 font-medium">
                            {item.role}
                        </p>
                    </div>

                    {/* Column 2: Tools (4 cols) */}
                    <div className="md:col-span-4 flex flex-col gap-2">
                        {item.tools && item.tools.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {item.tools.map((tool) => (
                                    <span
                                        key={tool}
                                        className="px-3 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm whitespace-nowrap"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column 3: Credits / Description (3 cols) */}
                    <div className="md:col-span-3 flex flex-col gap-1">
                        {item.creditLabel && (
                            <h4 className="font-bold text-base md:text-lg">
                                {item.creditLabel}
                            </h4>
                        )}
                        {item.creditLinks && (
                            <p className="text-zinc-600 underline decoration-zinc-300 underline-offset-4 leading-relaxed">
                                {item.creditLinks}
                            </p>
                        )}
                        {!item.creditLabel && !item.creditLinks && (
                            <div className="text-zinc-600">
                                <span className="italic text-sm">See details below</span>
                            </div>
                        )}
                    </div>

                    {/* Column 4: Thumbnail (6 cols) */}
                    <div className="md:col-span-6 w-full">
                        <div className="relative aspect-video bg-zinc-100 overflow-hidden shadow-sm">
                            {item.thumbnail && (
                                (item.thumbnail.endsWith('.mp4') || item.thumbnail.endsWith('.webm')) ? (
                                    <video
                                        ref={videoRef}
                                        src={item.thumbnail}
                                        loop
                                        muted
                                        playsInline
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <Image
                                        src={item.thumbnail}
                                        alt={`${item.company} Thumbnail`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export function Experience({ items }: ExperienceProps) {
    return (
        <section className="bg-white text-zinc-900">
            <div className="flex flex-col">


                {items.map((item) => (
                    <ExperienceRow key={item._key} item={item} />
                ))}
                {/* Bottom border for the last item */}
                <div className="border-t border-zinc-200 w-full" />
            </div>
        </section>
    );
}
