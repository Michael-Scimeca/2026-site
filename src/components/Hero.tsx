"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useModal } from '@/context/ModalContext';
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
    const { openModal } = useModal();
    const [hoverTarget, setHoverTarget] = useState<'email' | 'book' | null>(null);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const portraitRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);

    const [heroHeight, setHeroHeight] = useState<string | undefined>(undefined);

    // Hold-to-act: auto-trigger action after liquid fill completes (4s)
    useEffect(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }

        if (hoverTarget === 'email') {
            hoverTimerRef.current = setTimeout(() => {
                const mailtoLink = document.createElement('a');
                mailtoLink.href = "mailto:mikeyscimeca.dev@gmail.com?subject=Let's Talk Strategy";
                mailtoLink.click();
                setHoverTarget(null);
            }, 4000);
        } else if (hoverTarget === 'book') {
            hoverTimerRef.current = setTimeout(() => {
                openModal();
                setHoverTarget(null);
            }, 4000);
        }

        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, [hoverTarget, openModal]);

    useEffect(() => {
        // Set fixed height once on mount to prevent mobile address bar resize jumps
        if (typeof window !== 'undefined') {
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

            // Content moves up (subtle parallax)
            gsap.to(contentRef.current, {
                y: "-75%",
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
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
            className="hero relative h-screen w-full overflow-hidden bg-black border-b border-white/20"
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
                <div className="absolute top-0 left-0 w-full h-full z-30 flex items-center justify-center pointer-events-none">
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
                        <div ref={contentRef} className="absolute z-50 flex flex-col items-start gap-1 pointer-events-auto
                            left-5 bottom-6 right-auto top-auto md:top-[calc(38%-50px)] md:left-[max(20px,calc(50%-220px))] lg:left-[calc(40%-100px)] xl:left-[calc(55%-100px)] md:right-auto md:bottom-auto
                            max-w-[85vw] md:min-w-[700px] 
                            md:rotate-[-2deg]
                            transition-[left,transform] duration-500 ease-out
                            will-change-transform">

                            {/* Mobile Scrim for Legibility */}
                            <div className="absolute -inset-6 bg-gradient-to-r from-black/80 via-black/40 to-transparent -z-10 rounded-xl blur-xl md:hidden" />

                            <h1 className="text-[clamp(26px,5vw,44px)] font-medium font-sans text-white leading-[1.1] tracking-tight whitespace-normal drop-shadow-lg md:drop-shadow-none">
                                🌟 I build high-impact<br className="hidden md:block" />{' '}
                                digital products, AI workflows,<br className="hidden md:block" />{' '}
                                and automation systems that<br className="hidden md:block" />{' '}
                                help teams grow and scale.
                            </h1>

                            <p className="text-white/90 md:text-white/70 text-[clamp(15px,4vw,18px)] mt-4 max-w-[600px] leading-relaxed drop-shadow-md md:drop-shadow-none">
                                Senior Web Developer & AI Automation Specialist — I help startups and brands ship intelligent solutions that save time and increase conversions.
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 mt-6 w-full md:w-auto">
                                <a
                                    href="mailto:mikeyscimeca.dev@gmail.com?subject=Let's Talk Strategy"
                                    onMouseEnter={() => setHoverTarget('email')}
                                    onMouseLeave={() => setHoverTarget(null)}
                                    className="relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium text-lg text-white overflow-hidden bg-transparent border border-white btn-liquid"
                                >
                                    {/* Liquid Fill Effect */}
                                    <div className="liquid-fill" />

                                    <span className="relative z-10">Email Me</span>
                                    <Image
                                        src="/Icon/email-icon.svg"
                                        alt="Email"
                                        width={24}
                                        height={24}
                                        className="relative z-10 invert"
                                    />
                                </a>

                                <button
                                    onClick={openModal}
                                    onMouseEnter={() => setHoverTarget('book')}
                                    onMouseLeave={() => setHoverTarget(null)}
                                    className="relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium text-lg text-white overflow-hidden bg-transparent border border-white btn-liquid"
                                >
                                    {/* Liquid Fill Effect */}
                                    <div className="liquid-fill" />

                                    <span className="relative z-10">Book Strategy Call</span>
                                    <Image
                                        src="/Icon/calendar-icons.svg"
                                        alt="Calendar"
                                        width={24}
                                        height={24}
                                        className="relative z-10"
                                    />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
