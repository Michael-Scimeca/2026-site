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

function ExperienceRow({ item, isFirst, isLast }: { item: ExperienceItem; isFirst?: boolean; isLast?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const thumbnailRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressCircleRef = useRef<SVGCircleElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // Only need to trigger once
                }
            },
            { rootMargin: '800px' } // Load significantly before it enters the viewport
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    const gsapTickerRef = useRef<gsap.TickerCallback | null>(null);

    const pulseRef = useRef<SVGPathElement>(null);

    // Generate stable random length for this item (40px - 150px)
    // We use a deterministic random based on item ID so it's consistent between server/client re-renders
    const pulseLength = React.useMemo(() => getPseudoRandom(item._key + 'pulse', 40, 150), [item._key]);
    const cycleLength = 2000; // Longer cycle for smoother, less frequent appearance

    useGSAP(() => {
        if (pulseRef.current) {
            gsap.fromTo(pulseRef.current,
                { strokeDashoffset: 0 },
                {
                    strokeDashoffset: -cycleLength,
                    duration: 4 + (pulseLength / 100), // Slight duration variance based on length
                    repeat: -1,
                    ease: "linear"
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
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
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

        // Cleanup function to ensure loop is removed
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

                    // Update circle stroke-dashoffset
                    // Circumference of r=8 is ~50.27
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
        <div
            ref={containerRef}
            className={`group w-full transition-colors relative py-0 ${item.thumbnail ? 'desktop:py-0' : 'desktop:py-[12px]'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                filter: `drop-shadow(0 0 4px ${activeThemeColor})`
                            }}
                        />
                    </svg>
                </div>
            )}

            {/* Top Border for First Item */}
            {isFirst && <div className="absolute top-0 left-0 w-full h-[1px] bg-zinc-800" />}
            {/* Dynamic Background Hover Glow */}
            {/* Dynamic Background Hover Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${activeThemeColor} 0%, transparent 70%)`
                }}
            />

            {/* Vertical Accent Glow Border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-y-90 group-hover:scale-y-100 origin-center"
                style={{
                    background: (item.company === 'NYC Pride' || item._key === 'nycpride')
                        ? 'linear-gradient(to bottom, #ef4444, #3b82f6, #a855f7)'
                        : activeThemeColor,
                    boxShadow: (item.company === 'NYC Pride' || item._key === 'nycpride')
                        ? `0 0 20px 2px #3b82f680`
                        : `0 0 20px 2px ${activeThemeColor}80`
                }}
            />

            <div className="desktop:!pr-0 relative z-10">
                <div className="flex flex-col-reverse desktop:grid desktop:grid-cols-16 desktop:items-center">
                    <div className="desktop:col-span-9 flex flex-col gap-6 desktop:py-2 desktop:pr-8 px-4 md:px-6 desktop:pl-8">
                        <div className="desktop:!p-0 desktop:!m-0 w-full">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
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
                                </div>

                                <div className="text-zinc-400 text-sm leading-relaxed font-medium">
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
                            </div>

                            {item.tools && item.tools.length > 0 && (
                                <div className="flex flex-wrap items-center mt-8 desktop:mt-3 pb-8 desktop:pb-2">
                                    {item.tools.map((tool, index) => (
                                        <React.Fragment key={tool}>
                                            {index !== 0 && (
                                                <span
                                                    className="pr-[5px] text-[10px] font-bold"
                                                    style={{ color: activeThemeColor }}
                                                >
                                                    ⌁
                                                </span>
                                            )}
                                            <SweetPunkText
                                                text={tool}
                                                className="pl-0 pr-[5px] py-1 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap"
                                                startColor="#52525b"
                                                midColor={activeThemeColor}
                                                endColor="#52525b"
                                                colorDuration={2.0}
                                                stagger={0.005} enableMotion={false}
                                            />
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 4: Thumbnail (5 cols) */}
                    <div className="desktop:col-span-7 w-full flex flex-col relative max-desktop:mb-8">

                        <ExperienceContainer>
                            <div
                                className="relative aspect-video overflow-hidden shadow-sm"
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
                                                    style={{ opacity: isVideoLoaded ? 1 : 0 }}
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
                                    className={`p-1.5 text-white rounded-full backdrop-blur-sm transition-all transform active:scale-95 ${isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
        </div >
    );
}

export function Experience({ items }: ExperienceProps) {
    return (
        <section className="bg-black text-white relative">
            {/* Global SVG Definitions - Guaranteed visibility */}
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
                {items.map((item, index) => (
                    <ExperienceRow
                        key={item._key}
                        item={item}
                        isFirst={index === 0}
                        isLast={index === items.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
