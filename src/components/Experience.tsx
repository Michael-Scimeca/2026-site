"use client";

import React, { useRef, useState, useEffect } from "react";
import { Container } from "@/components/Container";
import { ExperienceContainer } from "@/components/ExperienceContainer";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

import { PortableText } from "@portabletext/react";
import { SweetPunkText } from "./SweetPunkText";

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
    themeColor?: string;
    logo?: string;
    abbreviation?: string;
    parentCompany?: string;
    headline?: string;
    badge?: string;
    badgeEmoji?: string;
}

interface ExperienceProps {
    items: ExperienceItem[];
}

// Deterministic random number generator based on string
const getPseudoRandom = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = (Math.abs(hash) % 1000) / 1000;
    return Math.floor(normalized * (max - min + 1)) + min;
};

/* ─────────────────────────────────────────────
   TEXT-ONLY ROW  (items WITHOUT a thumbnail)
   Matches the new card design from the mockup
   ───────────────────────────────────────────── */
function TextExperienceRow({ item, index, isFirst }: { item: ExperienceItem; index: number; isFirst?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pulseRef = useRef<SVGPathElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);

    const activeThemeColor = React.useMemo(() => {
        if (item.themeColor) return item.themeColor;
        return '#0158ff';
    }, [item.themeColor]);

    const pulseLength = React.useMemo(() => getPseudoRandom(item._key + 'pulse', 40, 150), [item._key]);
    const cycleLength = 2000;

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
                    }
                }
            );
        }
    }, { scope: containerRef });

    // Animate tool pills from grey to theme color on scroll
    useGSAP(() => {
        if (toolsRef.current && containerRef.current) {
            const pills = toolsRef.current.querySelectorAll('.tool-pill');
            const bolts = toolsRef.current.querySelectorAll('.tool-bolt');
            const themeColor = `${activeThemeColor}99`;

            gsap.fromTo(pills,
                { borderColor: '#52525b', color: '#52525b' },
                {
                    borderColor: themeColor,
                    color: themeColor,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: toolsRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                }
            );

            gsap.fromTo(bolts,
                { color: '#52525b' },
                {
                    color: activeThemeColor,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: toolsRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                }
            );
        }
    }, { scope: containerRef });

    const displayNumber = String(index + 1);
    const abbreviation = item.abbreviation || item.company.split(' ').map(w => w[0]).join('').toUpperCase();

    return (
        <article
            ref={containerRef}
            className="group w-full relative py-10 desktop:py-14 transition-all"
            style={{
                borderLeft: `3px solid transparent`,
            }}
            onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = activeThemeColor;
            }}
            onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
            }}
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
                    <path d="M 0 5 H 1000" stroke="rgba(255,255,255,0.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <path
                        ref={pulseRef}
                        d="M 0 5 H 1000"
                        stroke={activeThemeColor}
                        strokeWidth="1.5"
                        strokeDasharray={`${pulseLength} ${cycleLength - pulseLength}`}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-0"
                    />
                </svg>
            </div>

            {isFirst && <div className="absolute top-0 left-0 w-full h-[1px] bg-white/[0.08]" />}

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
                                    backgroundColor: activeThemeColor,
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
                            <div className="text-3xl desktop:text-4xl font-black tracking-tight leading-none text-pretty" style={{ color: activeThemeColor }}>
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

                        <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-zinc-400 leading-tight">
                            {item.role}
                        </p>


                    </div>

                    {/* Right Column — Content */}
                    <div className="desktop:col-span-9 flex flex-col gap-5">
                        {item.badge && (
                            <div className="flex">
                                <span
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold tracking-wide rounded-full border"
                                    style={{
                                        borderColor: `${activeThemeColor}`,
                                        color: activeThemeColor,
                                        background: `${activeThemeColor}12`,
                                    }}
                                >
                                    {item.badgeEmoji && <span className="text-sm">{item.badgeEmoji}</span>}
                                    {item.badge}
                                </span>
                            </div>
                        )}

                        {item.headline && (
                            <h3 className="text-lg desktop:text-xl font-bold leading-snug max-w-2xl text-pretty">
                                <SweetPunkText
                                    text={item.headline}
                                    startColor="#52525b"
                                    midColor={activeThemeColor}
                                    endColor="#e4e4e7"
                                    colorDuration={2.0}
                                    stagger={0.005}
                                    enableMotion={false}
                                />
                            </h3>
                        )}

                        <div className="text-sm desktop:text-[15px] text-zinc-400 leading-relaxed max-w-2xl font-medium text-pretty">
                            {(() => {
                                const ptComponents = {
                                    block: {
                                        normal: ({ children }: any) => (
                                            <div className="mb-3 last:mb-0 text-sm desktop:text-[15px] leading-relaxed font-medium">
                                                {React.Children.map(children, child => {
                                                    if (typeof child === 'string') {
                                                        return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#a1a1aa" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                    }
                                                    return child;
                                                })}
                                            </div>
                                        ),
                                    },
                                    marks: {
                                        link: ({ children, value }: any) => (
                                            <a href={value.href} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2 decoration-white/40 transition-all hover:decoration-white/80">
                                                {React.Children.map(children, child => {
                                                    if (typeof child === 'string') {
                                                        return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#a1a1aa" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                    }
                                                    return child;
                                                })}
                                            </a>
                                        ),
                                        strong: ({ children }: any) => (
                                            <strong className="font-bold text-white">
                                                {React.Children.map(children, child => {
                                                    if (typeof child === 'string') {
                                                        return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                    }
                                                    return child;
                                                })}
                                            </strong>
                                        ),
                                    }
                                };

                                if (Array.isArray(item.description) && item.description.length > 0) {
                                    if (typeof item.description[0] === 'string') {
                                        return (item.description as string[]).map((p, i) => (
                                            <div key={i} className={`text-sm desktop:text-[15px] leading-relaxed font-medium ${i !== 0 ? "mt-3" : ""}`}>
                                                <SweetPunkText text={p} startColor="#52525b" midColor={activeThemeColor} endColor="#a1a1aa" colorDuration={2.0} stagger={0.005} enableMotion={false} />
                                            </div>
                                        ));
                                    }
                                    return <PortableText value={item.description} components={ptComponents} />;
                                }

                                if (typeof item.description === 'string') {
                                    return <SweetPunkText text={item.description as string} startColor="#52525b" midColor={activeThemeColor} endColor="#a1a1aa" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                }

                                return null;
                            })()}
                        </div>

                        {item.tools && item.tools.length > 0 && (
                            <div ref={toolsRef} className="flex flex-wrap items-center gap-2 mt-4">
                                {item.tools.map((tool, idx) => (
                                    <React.Fragment key={tool}>
                                        {idx !== 0 && (
                                            <span
                                                className="tool-bolt text-[10px] font-bold"
                                                style={{ color: '#52525b' }}
                                            >
                                                ⌁
                                            </span>
                                        )}
                                        <span
                                            className="tool-pill px-3 py-1 text-[11px] uppercase font-bold tracking-wider rounded-full border transition-colors duration-700"
                                            style={{
                                                borderColor: '#52525b',
                                                color: '#52525b',
                                                background: 'transparent',
                                            }}
                                            data-theme-color={`${activeThemeColor}99`}
                                        >
                                            {tool}
                                        </span>
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


/* ─────────────────────────────────────────────
   VIDEO ROW  (items WITH a thumbnail / video)
   Original layout preserved exactly as-is
   ───────────────────────────────────────────── */
function VideoExperienceRow({ item, isFirst, isLast }: { item: ExperienceItem; isFirst?: boolean; isLast?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const thumbnailRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressCircleRef = useRef<SVGCircleElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '800px' }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    const gsapTickerRef = useRef<gsap.TickerCallback | null>(null);

    const pulseRef = useRef<SVGPathElement>(null);

    const pulseLength = React.useMemo(() => getPseudoRandom(item._key + 'pulse', 40, 150), [item._key]);
    const cycleLength = 2000;

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

    // Animate tool pills from grey to theme color on scroll
    useGSAP(() => {
        if (toolsRef.current && containerRef.current) {
            const pills = toolsRef.current.querySelectorAll('.tool-pill');
            const bolts = toolsRef.current.querySelectorAll('.tool-bolt');
            const themeColor = `${activeThemeColor}99`;

            gsap.fromTo(pills,
                { borderColor: '#52525b', color: '#52525b' },
                {
                    borderColor: themeColor,
                    color: themeColor,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: toolsRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                }
            );

            gsap.fromTo(bolts,
                { color: '#52525b' },
                {
                    color: activeThemeColor,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: toolsRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                }
            );
        }
    }, { scope: containerRef });

    React.useEffect(() => {
        if (thumbnailRef.current && containerRef.current) {
            gsap.fromTo(thumbnailRef.current,
                { y: "-10%" },
                {
                    y: "10%",
                    force3D: true,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5
                    }
                }
            );
        }
    }, []);

    React.useEffect(() => {
        const isMobile = window.innerWidth <= 1000;
        if (isMobile && videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log("Mobile autoplay error:", e));
        }

        return () => {
            if (gsapTickerRef.current) {
                gsap.ticker.remove(gsapTickerRef.current);
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

                    const circumference = 50.27;
                    const offset = circumference - (progress * circumference);
                    progressCircleRef.current.style.strokeDashoffset = offset.toString();
                }
            };
            gsap.ticker.add(gsapTickerRef.current);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            if (gsapTickerRef.current) {
                gsap.ticker.remove(gsapTickerRef.current);
            }
        }
    };

    const activeThemeColor = React.useMemo(() => {
        if (item.themeColor) return item.themeColor;
        const c = item.company?.toLowerCase() || '';
        if (c.includes('pride') || item._key === 'nycpride') return '#ef4444';
        if (c.includes('patreon')) return '#FF424D';
        if (c.includes('twix')) return '#E89F29';
        if (c.includes('longview')) return '#22d3ee';
        return '#0158ff';
    }, [item.company, item.themeColor, item._key]);

    return (
        <article
            ref={containerRef}
            className={`group w-full transition-all relative py-0 ${item.thumbnail ? 'desktop:py-0' : 'desktop:py-[12px]'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                borderLeft: `3px solid transparent`,
            }}
            onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = (item.company === 'NYC Pride' || item._key === 'nycpride')
                    ? '#ef4444'
                    : activeThemeColor;
            }}
            onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
            }}
        >
            {/* Helix-Style Dual-Layer Bottom Border - Dash Pulse Animation */}
            {(
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-50" style={{ overflow: 'visible' }}>
                    <svg
                        width="100%"
                        height="10"
                        viewBox="0 0 1000 10"
                        preserveAspectRatio="none"
                        style={{ display: 'block', position: 'absolute', bottom: '-5px', left: 0, right: 0, overflow: 'visible' }}
                    >
                        <defs>
                            {/* Original Gradient */}
                            <linearGradient id={`experience-gradient-${item._key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#60a9ff" />
                                <stop offset="25%" stopColor="#6500ff" />
                                <stop offset="50%" stopColor="#006aff" />
                                <stop offset="75%" stopColor="#0900b3" />
                                <stop offset="100%" stopColor="#076dff" />
                            </linearGradient>

                        </defs>
                        {/* Static Base Line */}
                        <path
                            d="M 0 5 H 1000"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                        {/* Moving Pulse Line */}
                        <path
                            ref={pulseRef}
                            d="M 0 5 H 1000"
                            stroke={activeThemeColor}
                            strokeWidth="1.5"
                            strokeDasharray={`${pulseLength} ${cycleLength - pulseLength}`}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            className="opacity-0"
                        />
                    </svg>
                </div>
            )}

            {/* Top Border for First Item */}
            {isFirst && <div className="absolute top-0 left-0 w-full h-[1px] bg-zinc-800" />}
            {/* Dynamic Background Hover Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${activeThemeColor} 0%, transparent 70%)`
                }}
            />


            <div className="desktop:!pr-0 relative z-10">
                <div className="flex flex-col-reverse desktop:grid desktop:grid-cols-16 desktop:items-center">
                    <div className="desktop:col-span-9 flex flex-col gap-6 desktop:py-2 desktop:pr-8 px-4 md:px-6 desktop:pl-8">
                        <div className="desktop:!p-0 desktop:!m-0 w-full">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Logo + Role + Badge */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {item.logo ? (
                                        <div className={`relative w-auto ${item._key === 'outleadership' || item.company === 'Out Leadership' ? 'h-8 desktop:h-10 max-w-[500px]' : 'h-5 desktop:h-7 max-w-[200px]'}`}>
                                            <Image
                                                src={item.logo}
                                                alt={item.company}
                                                width={item._key === 'outleadership' || item.company === 'Out Leadership' ? 500 : 200}
                                                height={60}
                                                className="h-full w-auto object-contain object-left"
                                                priority
                                            />
                                        </div>
                                    ) : (
                                        <SweetPunkText
                                            text={item.company}
                                            className="font-bold text-lg desktop:text-xl tracking-tight"
                                            startColor="#52525b"
                                            midColor={activeThemeColor}
                                            colorDuration={2.0}
                                            stagger={0.005} enableMotion={false}
                                        />
                                    )}
                                    {item.role && item.role.length <= 50 && (
                                        <div className="text-zinc-400 font-medium text-sm desktop:text-base whitespace-nowrap">
                                            <SweetPunkText
                                                text={`— ${item.role}`}
                                                startColor="#52525b"
                                                midColor={activeThemeColor}
                                                endColor="#52525b"
                                                colorDuration={2.0}
                                                stagger={0.005} enableMotion={false}
                                            />
                                        </div>
                                    )}
                                    {item.badge && (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold tracking-wide rounded-full border"
                                            style={{
                                                borderColor: `${activeThemeColor}`,
                                                color: activeThemeColor,
                                                background: `${activeThemeColor}12`,
                                            }}
                                        >
                                            {item.badgeEmoji && <span className="text-sm">{item.badgeEmoji}</span>}
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Row 2: Description */}
                                <div className="text-zinc-400 text-sm leading-relaxed font-medium text-pretty">
                                    {(() => {
                                        const ptComponents = {
                                            block: {
                                                normal: ({ children }: any) => (
                                                    <div className="mb-3 last:mb-0 text-sm leading-relaxed font-medium">
                                                        {React.Children.map(children, child => {
                                                            if (typeof child === 'string') {
                                                                return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                            }
                                                            return child;
                                                        })}
                                                    </div>
                                                ),
                                            },
                                            marks: {
                                                link: ({ children, value }: any) => {
                                                    return (
                                                        <a href={value.href} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2 decoration-white/40 transition-all hover:decoration-white/80">
                                                            {React.Children.map(children, child => {
                                                                if (typeof child === 'string') {
                                                                    return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                                }
                                                                return child;
                                                            })}
                                                        </a>
                                                    );
                                                },
                                                strong: ({ children }: any) => (
                                                    <strong className="font-bold text-white">
                                                        {React.Children.map(children, child => {
                                                            if (typeof child === 'string') {
                                                                return <SweetPunkText text={child} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                                            }
                                                            return child;
                                                        })}
                                                    </strong>
                                                ),
                                            }
                                        };

                                        if (Array.isArray(item.description) && item.description.length > 0) {
                                            if (typeof item.description[0] === 'string') {
                                                return item.description.map((p, i) => (
                                                    <div key={i} className={`text-sm leading-relaxed font-medium ${i !== 0 ? "mt-3" : ""}`}>
                                                        <SweetPunkText text={p} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />
                                                    </div>
                                                ));
                                            }
                                            return <PortableText value={item.description} components={ptComponents} />;
                                        }

                                        if (typeof item.description === 'string') {
                                            return <SweetPunkText text={item.description} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                        }

                                        if (item.role.length > 50) {
                                            return <SweetPunkText text={item.role} startColor="#52525b" midColor={activeThemeColor} endColor="#ffffff" colorDuration={2.0} stagger={0.005} enableMotion={false} />;
                                        }

                                        return (
                                            <SweetPunkText
                                                text="Leading the technical direction and architectural design for high-scale digital platforms, focusing on creating seamless user experiences through performant, polished code."
                                                startColor="#52525b"
                                                midColor={activeThemeColor}
                                                endColor="#ffffff"
                                                colorDuration={2.0}
                                                stagger={0.005} enableMotion={false}
                                            />
                                        );
                                    })()}
                                </div>

                                {/* Row 3: Tool Pills */}
                                {item.tools && item.tools.length > 0 && (
                                    <div ref={toolsRef} className="flex flex-wrap items-center gap-2 mt-4 desktop:mt-1 pb-8 desktop:pb-2">
                                        {item.tools.map((tool, index) => (
                                            <React.Fragment key={tool}>
                                                {index !== 0 && (
                                                    <span
                                                        className="tool-bolt text-[10px] font-bold"
                                                        style={{ color: '#52525b' }}
                                                    >
                                                        ⌁
                                                    </span>
                                                )}
                                                <span
                                                    className="tool-pill px-3 py-1 text-[11px] uppercase font-bold tracking-wider rounded-full border transition-colors duration-700"
                                                    style={{
                                                        borderColor: '#52525b',
                                                        color: '#52525b',
                                                        background: 'transparent',
                                                    }}
                                                    data-theme-color={`${activeThemeColor}99`}
                                                >
                                                    {tool}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="desktop:col-span-7 w-full relative max-desktop:mb-8" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>

                        <ExperienceContainer>
                            <div
                                className="relative aspect-video overflow-hidden"
                                style={{ backgroundColor: activeThemeColor }}
                            >
                                {/* Shimmer Loading Overlay */}
                                {item.thumbnail && (/\.(mp4|webm)($|\?)/i.test(item.thumbnail)) && !isVideoLoaded && (
                                    <div className="absolute inset-0 z-10">
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(
                                                    110deg,
                                                    ${activeThemeColor}00 0%,
                                                    ${activeThemeColor}40 20%,
                                                    rgba(255,255,255,0.08) 40%,
                                                    rgba(255,255,255,0.12) 50%,
                                                    rgba(255,255,255,0.08) 60%,
                                                    ${activeThemeColor}40 80%,
                                                    ${activeThemeColor}00 100%
                                                )`,
                                                backgroundSize: '200% 100%',
                                                animation: 'shimmer 1.8s ease-in-out infinite',
                                            }}
                                        />
                                    </div>
                                )}
                                <div ref={thumbnailRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                                    {item.thumbnail && (
                                        (/\.(mp4|webm)($|\?)/i.test(item.thumbnail)) ? (
                                            isInView && (
                                                <video
                                                    key={item.thumbnail}
                                                    ref={videoRef}
                                                    src={item.thumbnail}
                                                    loop
                                                    muted
                                                    playsInline
                                                    autoPlay={window.innerWidth <= 1000}
                                                    className="w-full h-full transition-opacity duration-700 ease-out"
                                                    style={{ opacity: isVideoLoaded ? 1 : 0, transform: 'scale(1.25) translateY(-4%)', transformOrigin: 'top center' }}
                                                    onLoadedData={() => {
                                                        setIsVideoLoaded(true);
                                                        if (window.innerWidth <= 1000 && videoRef.current) {
                                                            videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                                                        }
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <Image
                                                src={item.thumbnail}
                                                alt={`${item.company} Thumbnail`}
                                                fill
                                                className="object-cover"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </ExperienceContainer>

                        {/* Controls Container - Positioned bottom-left relative to thumbnail */}
                        {item.thumbnail && (/\.(mp4|webm)($|\?)/i.test(item.thumbnail)) && (
                            <div className="absolute bottom-0 -left-20 hidden desktop:flex items-center z-20 opacity-100">
                                {/* Replay Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = 0;
                                            videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                                        }
                                    }}
                                    className={`p-1.5 text-white rounded-full transition-all transform active:scale-95 ${isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                    aria-label="Replay video"
                                    title="Replay"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                    </svg>
                                </button>

                                {/* Circular Progress Indicator */}
                                <div className="relative w-8 h-8 flex items-center justify-center rounded-full p-1">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 20 20">
                                        {/* Track */}
                                        <circle
                                            cx="10"
                                            cy="10"
                                            r="8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="text-white/25"
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
                                            className="transition-all duration-75 ease-linear"
                                            style={{ color: activeThemeColor }}
                                            strokeDasharray="50.27"
                                            strokeDashoffset="50.27"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </article >
    );
}

export function Experience({ items }: ExperienceProps) {
    // Track the index for text-only items separately (for the big background numbers)
    let textIndex = 0;

    return (
        <section id="experience" className="bg-black text-white relative" aria-label="Work experience">
            <h2 className="sr-only">Experience</h2>
            <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <defs>
                    <filter id="experience-helix-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="experience-helix-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a9ff" />
                        <stop offset="25%" stopColor="#6500ff" />
                        <stop offset="50%" stopColor="#006aff" />
                        <stop offset="75%" stopColor="#0900b3" />
                        <stop offset="100%" stopColor="#076dff" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="flex flex-col">
                {items.map((item, i) => {
                    const hasVideo = !!item.thumbnail;
                    if (hasVideo) {
                        return (
                            <VideoExperienceRow
                                key={item._key}
                                item={item}
                                isFirst={i === 0}
                                isLast={i === items.length - 1}
                            />
                        );
                    } else {
                        const currentTextIndex = textIndex;
                        textIndex++;
                        return (
                            <TextExperienceRow
                                key={item._key}
                                item={item}
                                index={currentTextIndex}
                                isFirst={i === 0}
                            />
                        );
                    }
                })}
            </div>
        </section>
    );
}
