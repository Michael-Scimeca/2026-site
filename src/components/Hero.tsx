"use client";

import React from 'react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { Container } from './Container';
import { StatusBadge } from './StatusBadge';
import { urlFor } from '@/sanity/lib/image';
import { type SanityImageSource } from "@sanity/image-url/lib/types/types";

interface HeroProps {
    title?: string;
    heroImage?: SanityImageSource & { alt?: string };

    headline?: string;
    subHeadline?: string;
}

export function Hero({ title, heroImage, headline, subHeadline }: HeroProps) {
    return (
        <section className="relative h-screen w-full bg-white md:p-[15px] overflow-hidden">
            <div className="relative h-full w-full overflow-hidden rounded-sm md:rounded-lg">
                {/* Title - Top Left (20px/20px) */}
                <h1 className="absolute top-[20px] left-[20px] z-50 text-lg md:text-xl font-medium tracking-tight text-white">
                    {title || 'Michael Scimeca'}
                </h1>

                {/* Status Badge - Top Right */}
                <div className="absolute top-[20px] right-[20px] z-50">
                    <StatusBadge />
                </div>

                {/* Background Texture Layer */}
                <div className="absolute inset-0 z-0 bg-[#656766]">
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
                <div className="absolute bottom-0 w-full z-20 md:z-0 overflow-hidden pointer-events-none pb-0">
                    <Marquee speed={80} direction="left" autoFill>
                        <span
                            className="font-medium font-sans text-white leading-none px-4"
                            style={{ fontSize: 'clamp(50px, 15vw, 250px)' }}
                        >
                            <span className="text-blue-300">⌁</span>Web Developer<span className="mx-[0.1em] text-blue-300">⌁</span>Designer<span className="mx-[0.1em] text-blue-300">⌁</span>AI Automation Engineer
                        </span>
                    </Marquee>
                </div>

                {/* Foreground Portrait Layer */}
                <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
                    <div className="relative w-full h-[85vh] md:h-full max-w-4xl">
                        <Image
                            src="/hero-portrait.png"
                            alt="Michael Scimeca"
                            fill
                            className="object-contain object-bottom"
                            priority
                            quality={100}
                            sizes="(max-width: 768px) 100vw, 80vw"
                        />

                        <div className="absolute top-[35%] right-[5%] md:right-[5%] lg:right-[10%] z-20 flex flex-col items-start gap-1 md:translate-x-[clamp(0px,calc(20vw-180px),160px)] max-w-[90vw] md:max-w-4xl">
                            <span className="text-[clamp(25px,3.1vw,44px)] font-medium font-sans text-white leading-[1.1] tracking-tight whitespace-nowrap md:whitespace-normal">
                                Building delightful digital<br />
                                experiences with code,<br />
                                design, and AI automation
                            </span>

                            <button className="mt-12 group relative flex items-center gap-6 pl-8 pr-3 py-3 bg-white hover:bg-[#f0f0f0] transition-all rounded-full pointer-events-auto cursor-pointer shadow-lg">
                                <span className="text-black font-semibold tracking-tight text-xl">Build Something Together</span>
                                <div className="w-12 h-12 bg-[#D1D1D1] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                                    <span className="sr-only">Contact</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
