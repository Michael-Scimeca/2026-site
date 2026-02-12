"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
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
    const [isHovering, setIsHovering] = useState(false);
    const [waterFilled, setWaterFilled] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const portraitRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);

    const [heroHeight, setHeroHeight] = useState<string | undefined>(undefined);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isHovering && !waterFilled) {
            timeout = setTimeout(() => {
                setWaterFilled(true);
                // Create a temporary link and click it to trigger mailto reliably
                const mailtoLink = document.createElement('a');
                mailtoLink.href = "mailto:mikeyscimeca.dev@gmail.com";
                mailtoLink.click();

                // Reset after a delay to allow the user to see the success state
                setTimeout(() => {
                    setWaterFilled(false);
                }, 3000);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [isHovering, waterFilled]);

    useEffect(() => {
        // Set fixed height on mobile to prevent address bar resizing jumps
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setHeroHeight(`${window.innerHeight}px`);
        }
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Background moves down relative to scroll (appears slower)
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

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            // Background parallax
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

            // Portrait moves down (parallax effect)
            gsap.to(portraitRef.current, {
                y: "45%",
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
                y: "-90%",
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
                y: "-25%",
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Marquee Infinite Scroll (X-axis) with Velocity
        if (marqueeInnerRef.current) {
            const tl = gsap.to(marqueeInnerRef.current, {
                xPercent: -50,
                ease: "none",
                duration: 20,
                repeat: -1
            });

            ScrollTrigger.create({
                trigger: document.body, // Watch global scroll for velocity, or container? Global is better for continuous effect.
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const vel = Math.abs(self.getVelocity());
                    // Base timescale 1. Adjust divisor to tune sensitivity. lower = more sensitive.
                    // Wanaka is quite fast. Try / 200.
                    const boost = vel / 200;
                    gsap.to(tl, {
                        timeScale: 1 + boost,
                        duration: 0.2,
                        overwrite: true,
                        onComplete: () => {
                            gsap.to(tl, { timeScale: 1, duration: 1.0, ease: "power1.out" });
                        }
                    });
                }
            });
        }
    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            className="hero relative h-[100svh] md:h-screen w-full overflow-hidden bg-black border-b border-white/20"
            style={heroHeight ? { height: heroHeight, minHeight: heroHeight, maxHeight: heroHeight } : undefined}
        >
            <div className="relative h-full w-full overflow-hidden bg-black">
                {/* Semantic Header for Top Elements */}
                <header>
                    {/* Title - Top Left (20px/20px) */}
                    <h1 className="absolute top-[20px] left-[20px] z-50 text-lg md:text-xl font-medium tracking-tight text-white leading-none">
                        {title || 'Michael Scimeca'}
                    </h1>

                    {/* Status Badge & Games - Top Right */}
                    <div className="absolute top-[20px] right-[20px] z-50 flex flex-col items-end pointer-events-auto gap-3">
                        <StatusBadge />
                        <div className="hidden md:flex items-start">
                            <GameContainer />
                        </div>
                    </div>
                </header>

                {/* Background Texture Layer - Increased height for parallax bleed */}
                <div ref={bgRef} className="absolute -top-[20%] inset-x-0 h-[140%] z-0 opacity-100 will-change-transform">
                    <Image
                        src="/hero-background.jpg?v=new"
                        alt="Background Texture"
                        fill
                        className="object-cover pointer-events-none scale-100 md:scale-110"
                        priority
                        unoptimized
                        quality={100}
                        sizes="100vw"
                    />
                </div>




                {/* Scrolling Marquee Layer */}
                <div ref={marqueeRef} className="absolute bottom-0 w-full z-20 md:z-0 overflow-hidden pointer-events-none pb-0 will-change-transform">
                    <div ref={marqueeInnerRef} className="flex w-fit whitespace-nowrap">
                        {[...Array(2)].map((_, i) => (
                            <span
                                key={i}
                                className="font-medium font-sans text-white leading-[1.2] px-4 flex items-center shrink-0"
                                style={{ fontSize: 'clamp(50px, 15vw, 250px)' }}
                            >
                                <GradientBolt />Web Developer<GradientBolt />Designer<GradientBolt />AI Automation Engineer
                            </span>
                        ))}
                    </div>
                </div>

                {/* Foreground Portrait Layer - Increased height for bleed */}
                <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center pointer-events-none">
                    <div ref={portraitRef} className="relative w-full h-full top-0 md:h-[110%] md:top-[10%] max-w-4xl flex items-end will-change-transform">
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
                        <div ref={contentRef} className="absolute top-[calc(38%-40px)] right-[calc(25%-90px)] z-20 flex flex-col items-start gap-1 md:translate-x-[clamp(0px,calc(20vw-180px),210px)] max-w-[90vw] md:max-w-4xl [transform:translate3d(0px,-0.0002%,0px)_rotate(-2.00003deg)] md:transform md:-rotate-2 will-change-transform">
                            <span className="text-[clamp(25px,3.1vw,44px)] font-medium font-sans text-white leading-[1.2] tracking-tight whitespace-nowrap md:whitespace-normal">
                                I Build Revenue-Driving<br />
                                Digital Products &<br />
                                Automated Systems
                            </span>

                            <p className="text-white/70 text-[clamp(14px,1.2vw,18px)] mt-3 max-w-[500px] leading-relaxed">
                                Helping teams scale their workflows with AI-powered solutions and high-performing web experiences.
                            </p>

                            <div className="flex items-center gap-4 mt-6">
                                <a
                                    href="mailto:mikeyscimeca.dev@gmail.com"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                    className={`shiny-cta water-fill-container pointer-events-auto flex items-center gap-4 transition-all duration-300 ${waterFilled ? 'charged-active' : ''}`}
                                >
                                    <div className={`water-fill-background ${isHovering ? 'water-fill-active' : ''}`} />

                                    <span className={`relative z-10 transition-colors duration-300`}>
                                        {waterFilled ? 'Opening Email...' : 'Schedule a 15-min Call'}
                                    </span>

                                    <div className="relative z-10">
                                        <div className="relative w-12 h-12">
                                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                                <defs>
                                                    <mask id="phone-mask">
                                                        <rect width="100" height="100" fill="white" />
                                                        <image
                                                            href="/phone-icon.svg"
                                                            x="20" y="20"
                                                            width="60" height="60"
                                                            style={{ filter: 'brightness(0)' }}
                                                        />
                                                    </mask>
                                                </defs>
                                                <circle cx="50" cy="50" r="50" fill="white" mask="url(#phone-mask)" />
                                            </svg>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
