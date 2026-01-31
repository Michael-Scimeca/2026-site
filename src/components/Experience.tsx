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
    const progressCircleRef = useRef<SVGCircleElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const gsapTickerRef = useRef<() => void>(null);

    React.useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile && videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log("Mobile autoplay error:", e));
        }

        // Cleanup function to ensure loop is removed
        return () => {
            if (gsapTickerRef.current) {
                const ticker = gsapTickerRef.current;
                import('gsap').then(m => m.gsap.ticker.remove(ticker));
            }
        };
    }, [item.thumbnail]);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log("Play error:", e));

            gsapTickerRef.current = () => {
                if (videoRef.current && progressCircleRef.current) {
                    const duration = videoRef.current.duration || 1;
                    const currentTime = videoRef.current.currentTime;
                    const progress = currentTime / duration;

                    // Update circle stroke-dashoffset
                    // Circumference of r=8 is ~50.27
                    const circumference = 50.27;
                    const offset = circumference - (progress * circumference);
                    progressCircleRef.current.style.strokeDashoffset = offset.toString();
                }
            };
            import('gsap').then(m => m.gsap.ticker.add(gsapTickerRef.current!));
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            if (gsapTickerRef.current) {
                import('gsap').then(m => m.gsap.ticker.remove(gsapTickerRef.current!));
            }
        }
    };

    return (
        <div
            className="group w-full transition-colors hover:bg-zinc-900 border-zinc-800 max-md:border-b max-md:py-4 md:border-t"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Container className="!pr-0">
                <div className="grid grid-cols-1 md:grid-cols-16 gap-y-6 md:gap-x-6 items-center">
                    <div className="md:col-span-3 flex flex-col gap-1">
                        <h3 className="font-bold text-lg md:text-xl tracking-tight">
                            {item.company}
                        </h3>
                        <p className="text-zinc-400 font-medium">
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
                                        className="px-3 py-1 bg-white text-black text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm whitespace-nowrap"
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
                            <p className="text-zinc-400 underline decoration-zinc-600 underline-offset-4 leading-relaxed">
                                {item.creditLinks}
                            </p>
                        )}
                        {!item.creditLabel && !item.creditLinks && (
                            <div className="text-zinc-500">
                                <span className="italic text-sm">See details below</span>
                            </div>
                        )}
                    </div>

                    {/* Column 4: Thumbnail (6 cols) */}
                    <div className="md:col-span-6 w-full flex flex-col relative">
                        <div className="relative aspect-video overflow-hidden shadow-sm">
                            {item.thumbnail && (
                                (item.thumbnail.endsWith('.mp4') || item.thumbnail.endsWith('.webm')) ? (
                                    <video
                                        key={item.thumbnail}
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

                        {/* Controls Container - Moved outside and positioned bottom-left */}
                        {item.thumbnail && (item.thumbnail.endsWith('.mp4') || item.thumbnail.endsWith('.webm')) && (
                            <div className="absolute bottom-0 -left-20 hidden md:flex items-center z-20 opacity-100">
                                {/* Replay Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = 0;
                                            videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                                        }
                                    }}
                                    className={`p-1.5 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95 ${isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                    aria-label="Replay video"
                                    title="Replay"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                    </svg>
                                </button>

                                {/* Circular Progress Indicator */}
                                <div className="relative w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm p-1">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 20 20">
                                        {/* Track */}
                                        <circle
                                            cx="10"
                                            cy="10"
                                            r="8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="text-white/10"
                                        />
                                        {/* Progress */}
                                        <circle
                                            ref={progressCircleRef}
                                            cx="10"
                                            cy="10"
                                            r="8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="text-[#0158ff] transition-all duration-75 ease-linear"
                                            strokeDasharray="50.27"
                                            strokeDashoffset="50.27"
                                        />
                                    </svg>
                                </div>
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
        <section className="bg-black text-white">
            <div className="flex flex-col">


                {items.map((item) => (
                    <ExperienceRow key={item._key} item={item} />
                ))}
                {/* Bottom border for the last item */}
                <div className="border-t border-zinc-800 w-full max-md:hidden" />
            </div>
        </section>
    );
}
