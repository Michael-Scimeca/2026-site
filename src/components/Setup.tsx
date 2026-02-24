"use client";

import React, { useRef } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";
import { SweetPunkText } from "@/components/SweetPunkText";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SetupItem {
    id: string;
    company: string;
    description: string;
    logo?: string;
    tools?: string[];
    themeColor?: string;
    badge?: string;
    badgeEmoji?: string;
    headline?: string;
    role?: string;
    abbreviation?: string;
    parentCompany?: string;
}

const setupItems: SetupItem[] = [
    {
        id: "nycpride",
        company: "NYC Pride",
        description: "I worked as part of RSQ on building the NYC Pride website, contributing to development and implementation to ensure the site launched successfully in time for Pride Day. The work focused on delivering a responsive, accessible, and visually engaging experience under a fixed deadline, supporting one of New York City’s most high-profile annual events and its large, diverse audience.",
        logo: "/logos/nycpride.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework", "Gsap"],
        themeColor: "#5575f6",
        role: "Front-End Development",
        badge: "High-profile event launch",
        badgeEmoji: "🌈",
        headline: "Delivered a responsive, accessible site for one of NYC’s biggest annual events",
    },
    {
        id: "seiu",
        company: "SEIU",
        description: "Service Employees International Union (SEIU) is one of North America’s largest labor unions, representing millions of workers across healthcare, public services, and property services. I contributed development support on SEIU.org, working on site updates that helped clearly present the organization’s goals, mission, and key initiatives, ensuring core messaging was accessible, well-structured, and aligned with SEIU’s advocacy efforts.",
        logo: "/logos/seiu.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework"],
        themeColor: "#a855f7",
        role: "Front-End Development",
        badge: "Mission-driven platform",
        badgeEmoji: "✊",
        headline: "Structured advocacy messaging for North America\u2019s largest labor union",
    },
    {
        id: "nether-realm",
        company: "Nether Realm",
        description: "NetherRealm Studios, creators of the iconic Mortal Kombat franchise, are known for bold visuals, cinematic intensity, and unmistakable atmosphere. I collaborated with the agency We Can’t Stop Thinking to design a 6-page website and blog experience, with the goal of staying as close as possible to the essence of Mortal Kombat.\n\nThe design focused on immediate recognition — creating an experience where the moment you land on the site, you feel Mortal Kombat. Dark, high-contrast visuals, dramatic typography, and cinematic pacing were used to echo the franchise’s intensity, lore, and legacy, while still supporting a clear, modern web experience.",
        logo: "/logos/nether.png",
        tools: ["Photoshop"],
        themeColor: "#f7973b",
        role: "Design & Creative Direction",
        badge: "Iconic franchise experience",
        badgeEmoji: "🐉",
        headline: "Designed a cinematic web presence true to the Mortal Kombat legacy",
    },
    {
        id: "optimo",
        company: "Optimo",
        description: "Optimo is a premium hat brand known for exceptional craftsmanship and timeless design. I teamed up with the agency We Can’t Stop Thinking to support the Shop Optimo e-commerce experience, creating and organizing digital assets while ensuring a seamless handoff to additional designers as the project evolved.",
        logo: "/logos/logo-hat.png",
        tools: ["Photoshop"],
        themeColor: "#14b8a6",
        role: "Design & Asset Production",
        badge: "Premium e-commerce brand",
        badgeEmoji: "🎩",
        headline: "Crafted digital assets for a timeless luxury hat brand",
    },
];

// Deterministic random number generator based on string
const getPseudoRandom = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = (Math.abs(hash) % 1000) / 1000;
    return Math.floor(normalized * (max - min + 1)) + min;
};

function SetupRow({ item, index, isLast }: { item: SetupItem; index: number; isLast?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pulseRef = useRef<SVGPathElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const activeThemeColor = item.themeColor || '#0158ff';
    const pulseLength = React.useMemo(() => getPseudoRandom(item.id + 'pulse', 40, 150), [item.id]);
    const cycleLength = 2000;

    const displayNumber = String(index + 1);
    const abbreviation = item.abbreviation || item.company.split(' ').map(w => w[0]).join('').toUpperCase();

    useGSAP(() => {
        if (pulseRef.current && containerRef.current) {
            const pulseTl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    fastScrollEnd: true,
                    once: true
                }
            });

            pulseTl.fromTo(pulseRef.current,
                { opacity: 0, strokeDashoffset: 0 },
                {
                    opacity: 1,
                    strokeDashoffset: -cycleLength * 0.3,
                    duration: 0.8,
                    ease: "power2.out"
                },
                0
            );

            pulseTl.to(pulseRef.current,
                {
                    opacity: 0,
                    strokeDashoffset: -cycleLength * 0.6,
                    duration: 1.2,
                    ease: "power2.inOut"
                }
            );
        }
    }, { scope: containerRef });

    useGSAP(() => {
        if (contentRef.current && containerRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                        once: true
                    }
                }
            );
        }
    }, { scope: containerRef });

    return (
        <article
            ref={containerRef}
            className="group w-full relative py-10 desktop:py-14"
        >
            {/* Bottom Border with Pulse */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-50" style={{ overflow: 'visible' }}>
                <svg
                    width="100%"
                    height="10"
                    viewBox="0 0 1000 10"
                    preserveAspectRatio="none"
                    style={{ display: 'block', position: 'absolute', bottom: '-5px', left: 0, right: 0, overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id={`setup-gradient-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#60a9ff" />
                            <stop offset="25%" stopColor="#6500ff" />
                            <stop offset="50%" stopColor="#006aff" />
                            <stop offset="75%" stopColor="#0900b3" />
                            <stop offset="100%" stopColor="#076dff" />
                        </linearGradient>
                        {item.id === 'nycpride' && (
                            <linearGradient id="rainbow-pulse-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="1000" y2="5">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="20%" stopColor="#f97316" />
                                <stop offset="40%" stopColor="#eab308" />
                                <stop offset="55%" stopColor="#22c55e" />
                                <stop offset="70%" stopColor="#3b82f6" />
                                <stop offset="85%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        )}
                    </defs>
                    <path d="M 0 5 H 1000" stroke="rgba(255,255,255,0.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <path
                        ref={pulseRef}
                        d="M 0 5 H 1000"
                        stroke={item.id === 'nycpride' ? 'url(#rainbow-pulse-gradient)' : activeThemeColor}
                        strokeWidth="1.5"
                        strokeDasharray={`${pulseLength} ${cycleLength - pulseLength}`}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-0"
                    />
                </svg>
            </div>

            {/* Hover Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 60% 50%, ${activeThemeColor} 0%, transparent 70%)` }}
            />

            <div ref={contentRef} className="relative z-10 px-4 md:px-6 desktop:px-8 max-w-[1440px] mx-auto">
                <div className="flex flex-col desktop:grid desktop:grid-cols-12 desktop:gap-8 desktop:items-start">

                    {/* Left Column — Client Info */}
                    <div className="desktop:col-span-3 flex flex-col gap-2 mb-6 desktop:mb-0 relative">
                        {item.logo ? (
                            <div
                                className="relative h-10 desktop:h-12 max-w-[180px]"
                                style={{
                                    background: item.id === 'nycpride'
                                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #f59e0b)'
                                        : activeThemeColor,
                                    maskImage: `url(${item.logo})`,
                                    WebkitMaskImage: `url(${item.logo})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'left center',
                                    WebkitMaskPosition: 'left center',
                                    width: '180px',
                                }}
                            />
                        ) : (
                            <div className="text-3xl desktop:text-4xl font-black tracking-tight leading-none" style={{ color: activeThemeColor }}>
                                <SweetPunkText
                                    text={abbreviation}
                                    startColor="#52525b"
                                    midColor={activeThemeColor}
                                    endColor={activeThemeColor}
                                    colorDuration={2.0}
                                    stagger={0.005}
                                    enableMotion={false}
                                />
                            </div>
                        )}

                        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold leading-tight mt-1" style={{ color: `${activeThemeColor}99` }}>
                            {item.parentCompany || item.company}
                        </p>

                        {item.role && (
                            <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-zinc-400 leading-tight">
                                {item.role}
                            </p>
                        )}

                        {/* Large Background Number */}
                        <div
                            className="hidden desktop:block absolute -bottom-6 -left-2 text-[12rem] font-black leading-none pointer-events-none select-none"
                            style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255, 255, 255, 0.04)' }}
                            aria-hidden="true"
                        >
                            {displayNumber}
                        </div>
                    </div>

                    {/* Right Column — Content */}
                    <div className="desktop:col-span-9 flex flex-col gap-5">
                        {item.badge && (
                            <div className="flex">
                                <span
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold tracking-wide rounded-full border"
                                    style={{
                                        borderColor: item.id === 'nycpride' ? '#8b5cf650' : `${activeThemeColor}50`,
                                        color: item.id === 'nycpride' ? '#a78bfa' : activeThemeColor,
                                        background: item.id === 'nycpride'
                                            ? 'linear-gradient(135deg, #3b82f612, #8b5cf612)'
                                            : `${activeThemeColor}12`,
                                    }}
                                >
                                    {item.badgeEmoji && <span className="text-sm">{item.badgeEmoji}</span>}
                                    {item.badge}
                                </span>
                            </div>
                        )}

                        {item.headline && (
                            <h3 className="text-lg desktop:text-xl font-bold text-white/90 leading-snug max-w-2xl">
                                {item.headline}
                            </h3>
                        )}

                        {item.description.split('\n\n').map((paragraph, i) => (
                            <div key={i} className="text-sm desktop:text-[15px] leading-relaxed font-medium">
                                <SweetPunkText
                                    text={paragraph}
                                    startColor="#52525b"
                                    midColor={activeThemeColor}
                                    endColor="#a1a1aa"
                                    colorDuration={2.0}
                                    stagger={0.005}
                                    enableMotion={false}
                                />
                            </div>
                        ))}

                        {item.tools && item.tools.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                {item.tools.map((tool, idx) => (
                                    <React.Fragment key={tool}>
                                        {idx !== 0 && (
                                            <span
                                                className="text-[10px] font-bold"
                                                style={{
                                                    color: item.id === 'nycpride'
                                                        ? ['#ef4444', '#3b82f6', '#a855f7'][(idx - 1) % 3]
                                                        : activeThemeColor
                                                }}
                                            >
                                                ⌁
                                            </span>
                                        )}
                                        {(() => {
                                            const prideColors = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899'];
                                            const pillColor = item.id === 'nycpride' ? prideColors[idx % prideColors.length] : activeThemeColor;
                                            return (
                                                <span
                                                    className="px-3 py-1 text-[11px] uppercase font-bold tracking-wider rounded-full border transition-colors duration-300 group-hover:border-opacity-60"
                                                    style={{
                                                        borderColor: `${pillColor}30`,
                                                        color: `${pillColor}cc`,
                                                        background: `${pillColor}08`,
                                                    }}
                                                >
                                                    {tool}
                                                </span>
                                            );
                                        })()}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export function Setup() {
    return (

        <section id="setup" className="bg-black text-white relative" aria-label="Development setup">
            <h2 className="sr-only">Setup</h2>
            <div className="flex flex-col">
                {setupItems.map((item, index) => (
                    <SetupRow
                        key={item.id}
                        item={item}
                        index={index}
                        isLast={index === setupItems.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
