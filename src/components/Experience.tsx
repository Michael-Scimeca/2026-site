"use client";

import React, { useRef, useState, useEffect } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { PortableText } from "@portabletext/react";

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
}

interface ExperienceProps {
    items: ExperienceItem[];
}

function ExperienceRow({ item, isFirst, isLast }: { item: ExperienceItem; isFirst?: boolean; isLast?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const thumbnailRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressCircleRef = useRef<SVGCircleElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInView, setIsInView] = useState(false);

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

    return (
        <div
            className={`group w-full transition-colors relative border-zinc-800 py-8 ${item.thumbnail ? 'desktop:py-0' : 'desktop:py-8'} ${isFirst ? 'border-t' : ''} ${!isLast ? 'border-b' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Dynamic Background Hover Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${item.themeColor || '#0158ff'} 0%, transparent 70%)`
                }}
            />

            {/* Vertical Accent Glow Border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-y-90 group-hover:scale-y-100 origin-center"
                style={{
                    backgroundColor: item.themeColor || '#0158ff',
                    boxShadow: `0 0 20px 2px ${item.themeColor || '#0158ff'}80`
                }}
            />

            <div className="desktop:container-custom desktop:!pr-0 relative z-10">
                <div className="flex flex-col-reverse desktop:grid desktop:grid-cols-16 items-center ">
                    <div className="desktop:col-span-11 flex flex-col gap-6 desktop:py-2 desktop:pr-2">
                        <Container className="desktop:!p-0 desktop:!m-0 desktop:!max-w-none">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-lg desktop:text-xl tracking-tight">
                                        {item.company}
                                    </span>
                                    {item.role && item.role.length <= 50 && (
                                        <span className="text-zinc-400 font-medium text-sm desktop:text-base">
                                            — {item.role}
                                        </span>
                                    )}
                                </div>

                                <div className="text-zinc-400 text-xs desktop:text-sm leading-relaxed font-medium max-w-2xl">
                                    {(() => {
                                        const renderTextWithThemedPunctuation = (text: string) => {
                                            const isNYCPride = item.company === 'NYC Pride' || item._key === 'nycpride';
                                            return text.split(/([.,])/).map((part, index) => {
                                                if (part === '.' || part === ',') {
                                                    const colorIndex = Math.floor(index / 2);
                                                    return (
                                                        <span key={index} style={{
                                                            color: isNYCPride
                                                                ? ['#ef4444', '#3b82f6', '#a855f7'][colorIndex % 3]
                                                                : (item.themeColor || '#0158ff')
                                                        }}>{part}</span>
                                                    );
                                                }
                                                return <React.Fragment key={index}>{part}</React.Fragment>;
                                            });
                                        };

                                        if (Array.isArray(item.description) && item.description.length > 0) {
                                            if (typeof item.description[0] === 'string') {
                                                return item.description.map((p, i) => (
                                                    <p key={i} className={i !== 0 ? "mt-3" : ""}>
                                                        {renderTextWithThemedPunctuation(p)}
                                                    </p>
                                                ));
                                            }
                                            return <PortableText value={item.description} />;
                                        }

                                        if (typeof item.description === 'string') {
                                            return <p>{renderTextWithThemedPunctuation(item.description)}</p>;
                                        }

                                        if (item.role.length > 50) {
                                            return <p>{renderTextWithThemedPunctuation(item.role)}</p>;
                                        }

                                        return (
                                            <p>
                                                {renderTextWithThemedPunctuation("Leading the technical direction and architectural design for high-scale digital platforms, focusing on creating seamless user experiences through performant, polished code.")}
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>

                            {item.tools && item.tools.length > 0 && (
                                <div className="flex flex-wrap items-center mt-8 desktop:mt-3">
                                    {item.tools.map((tool, index) => (
                                        <React.Fragment key={tool}>
                                            {index !== 0 && (
                                                <span
                                                    className="pr-[5px] text-[10px] font-bold"
                                                    style={{ color: item.themeColor || '#0158ff' }}
                                                >
                                                    ⌁
                                                </span>
                                            )}
                                            <span
                                                className="pl-0 pr-[5px] py-1 text-white/60 text-[10px] uppercase font-bold tracking-wider rounded-full whitespace-nowrap"
                                            >
                                                {tool}
                                            </span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </Container>
                    </div>

                    {/* Column 4: Thumbnail (5 cols) */}
                    <div className="desktop:col-span-5 w-full flex flex-col relative max-desktop:mb-8" ref={containerRef}>
                        <div className="relative aspect-video overflow-hidden shadow-sm">
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
                                                className="object-cover w-full h-full"
                                                onLoadedData={() => {
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
                                            style={{ color: item.themeColor || '#0158ff' }}
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
        <section className="bg-black text-white ">

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
