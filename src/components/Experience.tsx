"use client";

import React, { useRef, useState } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";

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
    const progressBarRef = useRef<HTMLDivElement>(null);
    const gsapTickerRef = useRef<() => void>(null);

    React.useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile && videoRef.current) {
            videoRef.current.play().catch((e) => console.log("Mobile autoplay error:", e));

            gsapTickerRef.current = () => {
                if (videoRef.current && progressBarRef.current) {
                    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                    progressBarRef.current.style.width = `${progress}%`;
                }
            };
            import('gsap').then(m => m.gsap.ticker.add(gsapTickerRef.current!));
        }

        return () => {
            if (gsapTickerRef.current) {
                const ticker = gsapTickerRef.current;
                import('gsap').then(m => m.gsap.ticker.remove(ticker));
            }
        };
    }, [item.thumbnail]);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch((e) => console.log("Play error:", e));

            // GSAP Ticker for smooth progress updates
            gsapTickerRef.current = () => {
                if (videoRef.current && progressBarRef.current) {
                    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                    progressBarRef.current.style.width = `${progress}%`;
                }
            };
            import('gsap').then(m => m.gsap.ticker.add(gsapTickerRef.current!));
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            if (gsapTickerRef.current) {
                import('gsap').then(m => m.gsap.ticker.remove(gsapTickerRef.current!));
            }
        }
    };

    return (
        <div
            className="group w-full transition-colors hover:bg-zinc-50/50 border-zinc-200 max-md:border-b max-md:py-4 md:border-t"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-16 gap-y-6 md:gap-x-6 items-center">
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
                    <div className="md:col-span-6 w-full flex flex-col relative">
                        <div className="relative aspect-video bg-zinc-100 overflow-hidden shadow-sm">
                            {item.thumbnail && (
                                (item.thumbnail.endsWith('.mp4') || item.thumbnail.endsWith('.webm')) ? (
                                    <>
                                        <video
                                            key={item.thumbnail}
                                            ref={videoRef}
                                            src={item.thumbnail}
                                            loop
                                            muted
                                            playsInline
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (videoRef.current) {
                                                    videoRef.current.currentTime = 0;
                                                    videoRef.current.play().catch(console.error);
                                                }
                                            }}
                                            className="absolute top-3 right-3 z-20 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md transform hover:scale-110 active:scale-95"
                                            aria-label="Replay video"
                                            title="Replay"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                                                <path d="M3 3v9h9" />
                                            </svg>
                                        </button>
                                    </>
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
                        {item.thumbnail && (item.thumbnail.endsWith('.mp4') || item.thumbnail.endsWith('.webm')) && (
                            <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-zinc-100/50 overflow-hidden">
                                <div
                                    ref={progressBarRef}
                                    className="h-full bg-blue-500 w-0"
                                />
                            </div>
                        )}
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
                <div className="border-t border-zinc-200 w-full max-md:hidden" />
            </div>
        </section>
    );
}
