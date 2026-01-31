"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { StatusBadge } from './StatusBadge';
import { GameContainer } from './GameContainer';
import { GradientBolt } from './GradientBolt';
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
    isTransitionOverlay?: boolean;
}

export function Hero(props: HeroProps) {
    const { title, heroImage, headline, subHeadline, isTransitionOverlay } = props || {};
    const [timeToReach, setTimeToReach] = useState<string | null>(null);
    const [isTextVisible, setIsTextVisible] = useState(false);

    useEffect(() => {
        if (timeToReach) {
            setIsTextVisible(true);
            const timer = setTimeout(() => {
                setIsTextVisible(false);
            }, 10000); // Fade out after 10 seconds
            return () => clearTimeout(timer);
        }
    }, [timeToReach]);
    const startTimeRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const bgRef = useRef<HTMLDivElement>(null);
    const portraitRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startTimeRef.current = performance.now();
    }, []);

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

        // Background opacity fade out (starts at top, ends halfway through)
        gsap.to(bgRef.current, {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "center top",
                scrub: true
            }
        });

        // Portrait moves down slightly (appears deeper than text but in front of BG)
        gsap.to(portraitRef.current, {
            y: "16%",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Content moves up (appears to recede)
        gsap.to(contentRef.current, {
            y: "-20%",
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
        <section ref={containerRef} className="hero relative h-screen w-full overflow-hidden bg-black">
            <div className="relative h-full w-full overflow-hidden bg-black">
                {/* Title - Top Left (20px/20px) */}
                <h1 className="absolute top-[20px] left-[20px] z-50 text-lg md:text-xl font-medium tracking-tight text-white">
                    {title || 'Michael Scimeca'}
                </h1>

                {/* Status Badge & Games - Top Right */}
                <div className="absolute top-[20px] right-[20px] z-50 flex flex-col items-end pointer-events-auto gap-3">
                    <StatusBadge />
                    <div className="hidden md:flex items-start">
                        <GameContainer />
                    </div>
                </div>

                {/* Background Texture Layer - Increased height for parallax bleed */}
                <div ref={bgRef} className="absolute -top-[20%] inset-x-0 h-[140%] z-0 opacity-100">
                    <Image
                        src="/hero-background.jpg?v=new"
                        alt="Background Texture"
                        fill
                        className="object-cover pointer-events-none scale-110"
                        priority
                        unoptimized
                        quality={100}
                        sizes="100vw"
                    />
                </div>




                {/* Scrolling Marquee Layer */}
                <div ref={marqueeRef} className="absolute bottom-0 w-full z-20 md:z-0 overflow-hidden pointer-events-none pb-0">
                    <Marquee speed={80} direction="left" autoFill>
                        <span
                            className="font-medium font-sans text-white leading-[1.2] px-4 flex items-center"
                            style={{ fontSize: 'clamp(50px, 15vw, 250px)' }}
                        >
                            <GradientBolt />Web Developer<GradientBolt />Designer<GradientBolt />AI Automation Engineer
                        </span>
                    </Marquee>
                </div>

                {/* Foreground Portrait Layer - Increased height for bleed */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div ref={portraitRef} className="relative w-full h-[110%] top-[10%] max-w-4xl flex items-end">
                        <Image
                            src="/hero-portrait.png"
                            alt="Michael Scimeca"
                            fill
                            className="object-contain object-bottom"
                            priority
                            unoptimized
                            quality={100}
                            sizes="(max-width: 768px) 100vw, 80vw"
                        />

                        <div ref={contentRef} className="absolute top-[35%] right-[5%] md:right-[5%] lg:right-[10%] z-20 flex flex-col items-start gap-1 md:translate-x-[clamp(0px,calc(20vw-180px),210px)] max-w-[90vw] md:max-w-4xl [transform:translate3d(0px,-0.0002%,0px)_rotate(-2.00003deg)] md:transform md:-rotate-2">
                            <span className="text-[clamp(25px,3.1vw,44px)] font-medium font-sans text-white leading-[1.2] tracking-tight whitespace-nowrap md:whitespace-normal">
                                Building delightful digital<br />
                                experiences with code,<br />
                                design, and AI automation
                            </span>

                            <span className={`text-white/50 text-[10px] ml-10 mt-1 block transition-opacity duration-1000 ${isTextVisible ? 'opacity-100' : 'opacity-0'}`}>
                                {timeToReach || "0.00"} Seconds to reach Call To Action storing data...
                            </span>
                            <div className="flex items-center gap-12">
                                <div className="group relative inline-flex items-center p-2 bg-white/20 rounded-full pointer-events-auto backdrop-blur-sm shadow-sm">
                                    <a
                                        href="mailto:mikeyscimeca.dev@gmail.com"
                                        onMouseEnter={() => {
                                            if (!timeToReach) {
                                                const elapsed = (performance.now() - startTimeRef.current) / 1000;
                                                setTimeToReach(elapsed.toFixed(2));
                                            }
                                        }}
                                        className="flex items-center gap-6 px-5 py-2.5 bg-white transition-all rounded-full cursor-pointer hover:bg-white/90"
                                    >
                                        <span className="text-black font-semibold tracking-tight text-[clamp(18px,2vw,26px)]">Let's Build Something Together</span>
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
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
