"use client";

import React, { useRef } from 'react';
import { Container } from './Container';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOOLS = [
    {
        name: "Adobe Illustrator",
        src: "/tools/Adobe_Illustrator-OsCrp7J8q_brandlogos.net.svg",
        color: "#FF9A00",
        customFilter: 'brightness(0) saturate(100%) invert(58%) sepia(59%) saturate(4099%) hue-rotate(1deg) brightness(103%) contrast(106%)'
    },
    {
        name: "Adobe Photoshop",
        src: "/tools/Adobe_Photoshop-OC5sMTLt6_brandlogos.net.svg",
        color: "#31A8FF",
        customFilter: 'brightness(0) saturate(100%) invert(56%) sepia(61%) saturate(3786%) hue-rotate(188deg) brightness(103%) contrast(106%)'
    },
    { name: "Google Antigravity", src: "/tools/Google_Antigravity-logo_brandlogos.net_e23c83.svg", color: "#4285F4", customFilter: 'brightness(0) invert(1)' },
    { name: "Next.js", src: "/tools/Nextjs-logo.svg", color: "#000000", customFilter: 'brightness(0) invert(1)', className: "scale-75" },
    { name: "Docker", src: "/tools/docker.svg", color: "#2496ED", customFilter: 'brightness(0) invert(1)' },
    { name: "Figma", src: "/tools/figma.svg", color: "#F24E1E", customFilter: 'brightness(0) invert(1)' },
    { name: "Flywheel", src: "/tools/flywheel.svg", color: "#48C6DD", customFilter: 'brightness(0) invert(1)' },
    { name: "GitHub", src: "/tools/github.svg", color: "#181717", customFilter: 'brightness(0) invert(1)' },
    { name: "GSAP", src: "/tools/gsap.svg", color: "#88CE02", customFilter: 'brightness(0) invert(1)' },
    { name: "n8n", src: "/tools/n8n-color.svg", color: "#FF6584", customFilter: 'brightness(0) invert(1)' },
    { name: "Netlify", src: "/tools/Netlify.svg", color: "#00C7B7", customFilter: 'brightness(0) invert(1)' },
    { name: "Node.js", src: "/tools/node.js.svg", color: "#339933", customFilter: 'brightness(0) invert(1)' },
    { name: "Postman", src: "/tools/postman.svg?v=2", color: "#FF6C37", customFilter: 'brightness(0) invert(1)' },
    { name: "React", src: "/tools/react.svg", color: "#61DAFB", customFilter: 'brightness(0) invert(1)' },
    { name: "Slack", src: "/tools/slack.svg", color: "#4A154B", customFilter: 'brightness(0) invert(1)' },
    { name: "Tailwind CSS", src: "/tools/tailwind-css.svg", color: "#06B6D4", customFilter: 'brightness(0) invert(1)' },
    {
        name: "TypeScript",
        src: "/tools/typescript.svg",
        color: "#f1dd35",
        customFilter: 'brightness(0) saturate(100%) invert(84%) sepia(48%) saturate(718%) hue-rotate(353deg) brightness(101%) contrast(91%)'
    },
    { name: "WordPress", src: "/tools/WordPress_blue_logo.svg", color: "#21759b", customFilter: 'brightness(0) invert(1)' },
    { name: "BugHerd", src: "/tools/bugherd.svg", color: "#41CBA8", customFilter: 'brightness(0) invert(1)' },
    { name: "Google Analytics", src: "/tools/Logo_Google_Analytics.svg.png", color: "#F9AB00", customFilter: 'brightness(0) invert(1)' },
];

// --- Mobile/Stacked Item (< 1000px) ---
const StackedItem = ({ tool }: { tool: typeof TOOLS[0] }) => (
    <div className="flex items-center justify-center w-full aspect-square border-r border-b border-white/10 bg-white/5 relative transition-colors duration-300">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center opacity-100 transition-opacity duration-300">
            <Image
                src={tool.src}
                alt={tool.name}
                fill
                className={`object-contain ${tool.className || ''} mobile-logo-img`}
                style={{ filter: 'brightness(0) invert(1)' }}
            />
        </div>
    </div>
);

// --- Helix Constants & Item (>= 1000px) ---
const HELIX_Speed = 2;
const HELIX_Amp = 60;
const HELIX_Sep = 0.5;

function HelixItem({ tool, className, style }: { tool: typeof TOOLS[0], className?: string, style?: React.CSSProperties }) {
    return (
        <div
            className={`absolute flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 ${className}`}
            data-color={tool.color}
            data-custom-filter={tool.customFilter}
            style={{
                ...style,
                boxShadow: `0 0 15px 1px ${tool.color}30`,
                borderColor: `${tool.color}50`
            }}
        >
            <Image
                src={tool.src}
                alt={tool.name}
                width={60}
                height={60}
                className={`w-3/4 h-3/4 object-contain transition-all duration-500`}
                style={{
                    filter: tool.customFilter && !tool.customFilter.includes('brightness(0)') ? tool.customFilter : 'none'
                }}
            />
        </div>
    );
}

export function LogoTicker() {
    const containerRef = useRef<HTMLElement>(null);
    const strand1 = TOOLS.slice(0, 10);
    const strand2 = TOOLS.slice(10, 20);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        // -----------------------
        // MOBILE COLOR WAVE (< 1000px)
        // -----------------------
        mm.add("(max-width: 999px)", () => {
            const images = gsap.utils.toArray('.mobile-logo-img');

            // Logos change to color as you scroll into the area
            gsap.to(images, {
                filter: 'brightness(1) invert(0)', // Reveal original color
                stagger: 0.05,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%", // Start whenever the top of the section enters view
                    end: "bottom 50%", // Fully colored by the time user scrolls past middle
                    scrub: 1, // Smooth scrub linked to scroll position
                }
            });
        });

        // -----------------------
        // DESKTOP HELIX ANIMATION
        // -----------------------
        mm.add("(min-width: 1000px)", () => {
            const time = { value: 0 };
            const items1 = gsap.utils.toArray('.strand-1-item') as HTMLElement[];
            const items2 = gsap.utils.toArray('.strand-2-item') as HTMLElement[];
            const lines = gsap.utils.toArray('.helix-line') as HTMLElement[];
            const strand1Images = items1.map(item => item.querySelector('img') as HTMLImageElement);
            const strand2Images = items2.map(item => item.querySelector('img') as HTMLImageElement);

            const path1 = document.getElementById('helix-path-1') as unknown as SVGPathElement;
            const path2 = document.getElementById('helix-path-2') as unknown as SVGPathElement;
            const path1Pulse = document.getElementById('helix-path-1-pulse') as unknown as SVGPathElement;
            const path2Pulse = document.getElementById('helix-path-2-pulse') as unknown as SVGPathElement;

            const updateStrands = () => {
                const points1: { x: number, y: number }[] = [];
                const points2: { x: number, y: number }[] = [];

                const containerW = containerRef.current?.offsetWidth || 1000;
                const paddingX = 80; // Desktop padding
                const innerWidth = containerW - (paddingX * 2);
                /* 
                   The gap distribution in `justify-between` is (width / (n-1)).
                   We have 10 items, so 9 gaps.
                */
                const step = innerWidth / 9;

                // Loop from -3 to 12 to generate bleed-off lines
                for (let i = -3; i <= 12; i++) {
                    const angle = time.value + (i * HELIX_Sep);

                    const sin1 = Math.sin(angle);
                    const y1 = (sin1 * HELIX_Amp) + 100;
                    const x = paddingX + (i * step);
                    points1.push({ x, y: y1 });

                    const angle2 = angle + Math.PI;
                    const sin2 = Math.sin(angle2);
                    const y2 = (sin2 * HELIX_Amp) + 100;
                    points2.push({ x, y: y2 });

                    if (i >= 0 && i < 10) {
                        const line = lines[i];
                        const item1 = items1[i];
                        const item2 = items2[i];
                        const img1 = strand1Images[i];
                        const img2 = strand2Images[i];

                        if (line) {
                            const height = Math.abs(sin1 * HELIX_Amp * 2);
                            gsap.set(line, {
                                height: height,
                                opacity: height < 5 ? 0 : 0.15
                            });
                        }

                        if (item1) {
                            const cos1 = Math.cos(angle);
                            const scale1 = cos1 * 0.4 + 0.8;
                            const zIndex1 = cos1 > 0 ? 10 : 0;
                            const opacity1 = cos1 * 0.5 + 0.5;
                            const isForeground1 = cos1 > -0.2;

                            gsap.set(item1, {
                                y: sin1 * HELIX_Amp,
                                scale: scale1,
                                opacity: 0.3 + (opacity1 * 0.7),
                                zIndex: zIndex1,
                                borderColor: isForeground1 ? item1.dataset.color + '50' : 'rgba(255,255,255,0.1)',
                                boxShadow: isForeground1 ? `0 0 15px 1px ${item1.dataset.color}30` : 'none'
                            });

                            if (img1) {
                                gsap.set(img1, {
                                    filter: isForeground1
                                        ? (item1.dataset.customFilter && !item1.dataset.customFilter.includes('brightness(0)') ? item1.dataset.customFilter : 'none')
                                        : 'brightness(0) invert(1)'
                                });
                            }
                        }

                        if (item2) {
                            const cos2 = Math.cos(angle2);
                            const scale2 = cos2 * 0.4 + 0.8;
                            const zIndex2 = cos2 > 0 ? 10 : 0;
                            const opacity2 = cos2 * 0.5 + 0.5;
                            const isForeground2 = cos2 > -0.2;

                            gsap.set(item2, {
                                y: sin2 * HELIX_Amp,
                                scale: scale2,
                                opacity: 0.3 + (opacity2 * 0.7),
                                zIndex: zIndex2,
                                borderColor: isForeground2 ? item2.dataset.color + '50' : 'rgba(255,255,255,0.1)',
                                boxShadow: isForeground2 ? `0 0 15px 1px ${item2.dataset.color}30` : 'none'
                            });

                            if (img2) {
                                gsap.set(img2, {
                                    filter: isForeground2
                                        ? (item2.dataset.customFilter && !item2.dataset.customFilter.includes('brightness(0)') ? item2.dataset.customFilter : 'none')
                                        : 'brightness(0) invert(1)'
                                });
                            }
                        }
                    }
                }

                // Draw Paths
                const drawPath = (points: { x: number, y: number }[]) => {
                    if (points.length === 0) return "";
                    return `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
                };

                if (path1) path1.setAttribute("d", drawPath(points1));
                if (path2) path2.setAttribute("d", drawPath(points2));
                if (path1Pulse) path1Pulse.setAttribute("d", drawPath(points1));
                if (path2Pulse) path2Pulse.setAttribute("d", drawPath(points2));
            };

            // Initial Update
            updateStrands();

            // Scroll Trigger
            gsap.to(time, {
                value: Math.PI * 8,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
                onUpdate: updateStrands
            });

            // Pulse
            gsap.to(['#helix-path-1-pulse', '#helix-path-2-pulse'], {
                strokeDashoffset: -800,
                duration: 4,
                repeat: -1,
                ease: "linear"
            });
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="w-full bg-black pt-10 pb-0 md:py-12 overflow-hidden border-b border-white/5 relative">
            <Container className="mb-8">
                <div className="text-left">
                    <span className="text-zinc-500 text-sm md:text-base block">
                        Tools
                    </span>
                </div>
            </Container>

            {/* --- MOBILE: STACKED GRID (< 1000px) --- */}
            <div className="w-full min-[1000px]:hidden border-t border-l border-white/10">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 w-full">
                    {TOOLS.map((tool, i) => (
                        <StackedItem key={i} tool={tool} />
                    ))}
                </div>
            </div>

            {/* --- DESKTOP: HELIX (>= 1000px) --- */}
            <div className="hidden min-[1000px]:flex w-full relative h-[200px] justify-between px-20">
                {/* SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#60a9ff" />
                            <stop offset="25%" stopColor="#6500ff" />
                            <stop offset="50%" stopColor="#006aff" />
                            <stop offset="75%" stopColor="#0900b3" />
                            <stop offset="100%" stopColor="#076dff" />
                        </linearGradient>
                    </defs>
                    <path id="helix-path-1" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <path id="helix-path-2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    <path id="helix-path-1-pulse" fill="none" stroke="url(#pulse-gradient)" strokeWidth="2" strokeOpacity="1" strokeDasharray="20 380" filter="url(#glow-pulse)" />
                    <path id="helix-path-2-pulse" fill="none" stroke="url(#pulse-gradient)" strokeWidth="2" strokeOpacity="1" strokeDasharray="20 380" filter="url(#glow-pulse)" />
                </svg>

                {/* Helix Items Column Layout */}
                {strand1.map((tool, i) => (
                    <div key={i} className="relative h-full flex items-center justify-center w-0">
                        {/* Connecting Line */}
                        <div className="helix-line absolute w-[1px] bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        {/* Node 1 */}
                        <HelixItem tool={tool} className="strand-1-item" />

                        {/* Node 2 (Pair) */}
                        {strand2[i] && (
                            <HelixItem tool={strand2[i]} className="strand-2-item" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
