"use client";

import React, { useRef } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface TimelineItem {
    id: string;
    company: string;
    date: string;
    roles: {
        title: string;
        description: string[];
    }[];
}

interface TimelineProps {
    items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const moverRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current || !moverRef.current || !lineRef.current) return;

            // Animate the mover down the line
            gsap.to(moverRef.current, {
                y: () => lineRef.current!.offsetHeight - moverRef.current!.offsetHeight,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center",
                    end: "bottom bottom", // Changed from "bottom center" to ensure completion
                    scrub: true,
                },
            });
        },
        { scope: containerRef }
    );

    return (
        <section ref={containerRef} className="py-24 md:py-32 bg-white text-zinc-900 overflow-hidden">
            <Container>
                <div className="relative grid grid-cols-1 md:grid-cols-12 gap-x-8 md:gap-x-12 gap-y-16">
                    {/* The Center Line & Mover (Absolute) */}
                    <div
                        ref={lineRef}
                        className="absolute left-0 md:left-[33.33%] top-0 bottom-0 w-[2px] bg-blue-200 -translate-x-1/2 hidden md:block"
                    >
                        {/* The Moving Profile Picture (Tracker) */}
                        <div
                            ref={moverRef}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg overflow-hidden z-20 bg-zinc-100"
                        >
                            <Image
                                src="/hero-portrait.jpg"
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Timeline Items */}
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            {/* Column 1: Company (Left side) */}
                            <div className="md:col-span-2 flex flex-col justify-start">
                                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
                                    {item.company}
                                </h3>
                            </div>

                            {/* Column 2: Date (Left side, before line) */}
                            <div className="md:col-span-2 md:text-right flex flex-col justify-start pb-8 md:pb-0">
                                <span className="text-zinc-500 font-medium tabular-nums md:mt-2">
                                    {item.date}
                                </span>
                            </div>

                            {/* Space for the Line is implicit in the absolute positioning */}

                            {/* Column 3: Role (Right side, after line) */}
                            <div className="md:col-span-3 text-left flex flex-col gap-8 md:pl-8">
                                {item.roles.map((role, rIndex) => (
                                    <div key={rIndex} className="flex flex-col gap-1">
                                        <h4 className="text-lg md:text-xl font-bold text-zinc-800">
                                            {role.title}
                                        </h4>
                                    </div>
                                ))}
                            </div>

                            {/* Column 4: Description (Right side) */}
                            <div className="md:col-span-5 text-left flex flex-col gap-8">
                                {item.roles.map((role, rIndex) => (
                                    <div key={rIndex} className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-3 text-zinc-600 leading-relaxed font-light">
                                            {role.description.map((desc, dIndex) => (
                                                <p key={dIndex}>{desc}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </Container>
        </section>
    );
}
