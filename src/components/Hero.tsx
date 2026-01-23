"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { StatusBadge } from './StatusBadge';
import { urlFor } from '@/sanity/lib/image';
import { type SanityImageSource } from "@sanity/image-url/lib/types/types";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
    title?: string;
    heroImage?: SanityImageSource & { alt?: string };
    headline?: string;
    subHeadline?: string;
}

export function Hero({ title, heroImage, headline, subHeadline }: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const portraitRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Background moves down relative to scroll (appears slower)
        gsap.to(bgRef.current, {
            y: "15%",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Portrait moves down slightly (appears deeper than text but in front of BG)
        gsap.to(portraitRef.current, {
            y: "8%",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Content moves up and scales down (appears to recede/shrink)
        gsap.to(contentRef.current, {
            y: "-20%",
            scale: 0.8,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1.5
            }
        });

        // Marquee parallax - moves up slightly to feel "on top"
        gsap.to(marqueeRef.current, {
            y: "-15%",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative h-screen w-full bg-white md:p-[15px] overflow-hidden">
            <div className="relative h-full w-full overflow-hidden rounded-sm md:rounded-lg bg-[#656766]">
                {/* Title - Top Left (20px/20px) */}
                <h1 className="absolute top-[20px] left-[20px] z-50 text-lg md:text-xl font-medium tracking-tight text-white">
                    {title || 'Michael Scimeca'}
                </h1>

                {/* Status Badge - Top Right */}
                <div className="absolute top-[20px] right-[20px] z-50">
                    <StatusBadge />
                </div>

                {/* Background Texture Layer - Increased height for parallax bleed */}
                <div ref={bgRef} className="absolute -top-[20%] inset-x-0 h-[140%] z-0">
                    <Image
                        src="/hero-background.jpg"
                        alt="Background Texture"
                        fill
                        className="object-cover pointer-events-none"
                        style={{ filter: 'blur(19px)' }}
                        priority
                        quality={100}
                        sizes="100vw"
                    />
                </div>

                {/* Scrolling Marquee Layer */}
                <div ref={marqueeRef} className="absolute bottom-0 w-full z-20 md:z-0 overflow-hidden pointer-events-none pb-0">
                    <Marquee speed={80} direction="left" autoFill>
                        <span
                            className="font-medium font-sans text-white leading-[1.2] px-4"
                            style={{ fontSize: 'clamp(50px, 15vw, 250px)' }}
                        >
                            <span className="text-blue-300">⌁</span>Web Developer<span className="mx-[0.1em] text-blue-300">⌁</span>Designer<span className="mx-[0.1em] text-blue-300">⌁</span>AI Automation Engineer
                        </span>
                    </Marquee>
                </div>

                {/* Foreground Portrait Layer - Increased height for bleed */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div ref={portraitRef} className="relative w-full h-[110%] top-[10%] max-w-4xl flex items-end">
                        <Image
                            src={heroImage && !('src' in heroImage)
                                ? urlFor(heroImage).url()
                                : ((heroImage as any)?.src || "/hero-portrait-v2.png")}
                            alt={(heroImage as any)?.alt || "Michael Scimeca"}
                            fill
                            className="object-contain object-bottom"
                            priority
                            quality={100}
                            sizes="(max-width: 768px) 100vw, 80vw"
                        />

                        <div ref={contentRef} className="absolute top-[35%] right-[5%] md:right-[5%] lg:right-[10%] z-20 flex flex-col items-start gap-1 md:translate-x-[clamp(0px,calc(20vw-180px),210px)] max-w-[90vw] md:max-w-4xl">
                            <span className="text-[clamp(25px,3.1vw,44px)] font-medium font-sans text-white leading-[1.2] tracking-tight whitespace-nowrap md:whitespace-normal">
                                Building delightful digital<br />
                                experiences with code,<br />
                                design, and AI automation
                            </span>

                            <div className="mt-7 group relative inline-flex items-center p-[10px] bg-white/20 rounded-full pointer-events-auto backdrop-blur-sm shadow-sm">
                                <button className="flex items-center gap-6 pl-10 pr-8 py-5 bg-white transition-all rounded-full cursor-pointer">
                                    <span className="text-black font-semibold tracking-tight text-[clamp(18px,2vw,26px)]">Build Something Together</span>
                                    <div className="flex items-center justify-center">
                                        <svg
                                            width="30"
                                            height="30"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="text-black"
                                        >
                                            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
