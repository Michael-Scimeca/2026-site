"use client";

import React, { useRef } from 'react';
import { Container } from './Container';
import { PortableTextBlock } from 'sanity';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
    description?: PortableTextBlock[];
}

/* ── Tech stack items for the helix ── */
const TECH_STACK = [
    { name: "React", src: "/tools/react.svg", color: "#61DAFB", customFilter: 'brightness(0) invert(1)' },
    { name: "Next.js", src: "/tools/Nextjs-logo.svg", color: "#ffffff", customFilter: 'brightness(0) invert(1)' },
    { name: "TypeScript", src: "/tools/typescript.svg", color: "#3178C6", customFilter: 'brightness(0) saturate(100%) invert(84%) sepia(48%) saturate(718%) hue-rotate(353deg) brightness(101%) contrast(91%)' },
    { name: "GSAP", src: "/tools/gsap.svg", color: "#88CE02", customFilter: 'brightness(0) invert(1)' },
    { name: "Figma", src: "/tools/figma.svg", color: "#F24E1E", customFilter: 'brightness(0) invert(1)' },
    { name: "Node.js", src: "/tools/node.js.svg", color: "#339933", customFilter: 'brightness(0) invert(1)' },
    { name: "Tailwind CSS", src: "/tools/tailwind-css.svg", color: "#06B6D4", customFilter: 'brightness(0) invert(1)' },
    { name: "Docker", src: "/tools/docker.svg", color: "#2496ED", customFilter: 'brightness(0) invert(1)' },
    { name: "Adobe Illustrator", src: "/tools/Adobe_Illustrator-OsCrp7J8q_brandlogos.net.svg", color: "#FF9A00", customFilter: 'brightness(0) saturate(100%) invert(58%) sepia(59%) saturate(4099%) hue-rotate(1deg) brightness(103%) contrast(106%)' },
    { name: "Adobe Photoshop", src: "/tools/Adobe_Photoshop-OC5sMTLt6_brandlogos.net.svg", color: "#31A8FF", customFilter: 'brightness(0) saturate(100%) invert(56%) sepia(61%) saturate(3786%) hue-rotate(188deg) brightness(103%) contrast(106%)' },
    { name: "Google Antigravity", src: "/tools/Google_Antigravity-logo_brandlogos.net_e23c83.svg", color: "#4285F4", customFilter: 'brightness(0) invert(1)' },
    { name: "Sanity", src: "/tools/Sanity-logo.svg", color: "#F03E2F", customFilter: 'brightness(0) invert(1)' },
    { name: "n8n", src: "/tools/n8n-color.svg", color: "#FF6584", customFilter: 'brightness(0) invert(1)' },
    { name: "GitHub", src: "/tools/github.svg", color: "#ffffff", customFilter: 'brightness(0) invert(1)' },
    { name: "Claude", src: "/tools/claude.svg", color: "#D97757", customFilter: 'brightness(0) invert(1)' },
    { name: "WordPress", src: "/tools/WordPress_blue_logo.svg", color: "#21759b", customFilter: 'brightness(0) invert(1)' },
    { name: "Shopify", src: "/tools/shopify-logo-svg-vector.svg", color: "#96bf48", customFilter: 'brightness(0) invert(1)' },
    { name: "Netlify", src: "/tools/Netlify.svg", color: "#00C7B7", customFilter: 'brightness(0) invert(1)' },
    { name: "Postman", src: "/tools/postman.svg?v=2", color: "#FF6C37", customFilter: 'brightness(0) invert(1)' },
    { name: "Slack", src: "/tools/slack.svg", color: "#4A154B", customFilter: 'brightness(0) invert(1)' },
    { name: "BugHerd", src: "/tools/bugherd.svg", color: "#41CBA8", customFilter: 'brightness(0) invert(1)' },
    { name: "Google Analytics", src: "/tools/Logo_Google_Analytics.svg.png", color: "#F9AB00", customFilter: 'brightness(0) invert(1)' },
    { name: "UX Pilot", src: "/tools/ux-pilot-logo.svg", color: "#7C3AED", customFilter: 'brightness(0) invert(1)' },
    { name: "Prismic", src: "/tools/prismic-logo.svg", color: "#5163BA", customFilter: 'brightness(0) invert(1)' },
];

const HELIX_STRAND_SIZE = Math.ceil(TECH_STACK.length / 2);
const HELIX_AMP = 50;     // horizontal wave amplitude in px
const HELIX_SEP = 0.55;   // phase separation between items

function AboutHelixItem({ tool, className }: { tool: typeof TECH_STACK[0]; className?: string }) {
    return (
        <div
            className={`absolute flex items-center justify-center w-11 h-11 bg-black/60 rounded-full border border-white/10 backdrop-blur-sm ${className || ''}`}
            data-color={tool.color}
            data-custom-filter={tool.customFilter}
            style={{ willChange: 'transform, opacity' }}
        >
            <Image
                src={tool.src}
                alt={tool.name}
                width={48}
                height={48}
                className="w-3/4 h-3/4 object-contain transition-[filter] duration-500"
                style={{ filter: 'brightness(0) invert(1)' }}
            />
        </div>
    );
}

export function About({ description }: AboutProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const helixContainerRef = useRef<HTMLDivElement>(null);

    const strand1 = TECH_STACK.slice(0, HELIX_STRAND_SIZE);
    const strand2 = TECH_STACK.slice(HELIX_STRAND_SIZE);

    useGSAP(() => {
        if (!helixContainerRef.current || !sectionRef.current) return;

        const items1 = gsap.utils.toArray('.about-strand-1') as HTMLElement[];
        const items2 = gsap.utils.toArray('.about-strand-2') as HTMLElement[];
        const lines = gsap.utils.toArray('.about-helix-line') as HTMLElement[];
        const strand1Images = items1.map(item => item.querySelector('img') as HTMLImageElement);
        const strand2Images = items2.map(item => item.querySelector('img') as HTMLImageElement);

        const path1 = helixContainerRef.current?.querySelector('#about-helix-path-1') as SVGPathElement | null;
        const path2 = helixContainerRef.current?.querySelector('#about-helix-path-2') as SVGPathElement | null;
        const path1Pulse = helixContainerRef.current?.querySelector('#about-helix-path-1-pulse') as SVGPathElement | null;
        const path2Pulse = helixContainerRef.current?.querySelector('#about-helix-path-2-pulse') as SVGPathElement | null;

        const prevForeground1 = new Array(items1.length).fill(false);
        const prevForeground2 = new Array(items2.length).fill(false);
        let frameCount = 0;

        const time = { value: 0 };

        const updateStrands = () => {

            const points1: { x: number; y: number }[] = [];
            const points2: { x: number; y: number }[] = [];

            const containerH = helixContainerRef.current?.offsetHeight || 600;
            const paddingY = 40;
            const innerHeight = containerH - paddingY * 2;
            const itemCount = items1.length;
            const step = innerHeight / Math.max(itemCount - 1, 1);
            const centerX = (helixContainerRef.current?.offsetWidth || 200) / 2;

            for (let i = -2; i <= itemCount + 1; i++) {
                const angle = time.value + i * HELIX_SEP;

                const sin1 = Math.sin(angle);
                const x1 = sin1 * HELIX_AMP + centerX;
                const y = paddingY + i * step;
                points1.push({ x: x1, y });

                const angle2 = angle + Math.PI;
                const sin2 = Math.sin(angle2);
                const x2 = sin2 * HELIX_AMP + centerX;
                points2.push({ x: x2, y });

                if (i >= 0 && i < itemCount) {
                    const line = lines[i];
                    const item1 = items1[i];
                    const item2 = items2[i];
                    const img1 = strand1Images[i];
                    const img2 = strand2Images[i];

                    if (line) {
                        const width = Math.abs(sin1 * HELIX_AMP * 2);
                        gsap.set(line, {
                            width: width,
                            opacity: width < 5 ? 0 : 0.12,
                        });
                    }

                    if (item1) {
                        const cos1 = Math.cos(angle);
                        const scale1 = cos1 * 0.35 + 0.75;
                        const zIndex1 = cos1 > 0 ? 10 : 0;
                        const opacity1 = cos1 * 0.5 + 0.5;
                        const isForeground1 = cos1 > -0.2;

                        gsap.set(item1, {
                            x: sin1 * HELIX_AMP,
                            scale: scale1,
                            opacity: 0.3 + opacity1 * 0.7,
                            zIndex: zIndex1,
                        });

                        if (img1 && isForeground1 !== prevForeground1[i]) {
                            prevForeground1[i] = isForeground1;
                            img1.style.filter = isForeground1 ? 'none' : 'brightness(0) invert(1)';
                        }
                    }

                    if (item2) {
                        const cos2 = Math.cos(angle2);
                        const scale2 = cos2 * 0.35 + 0.75;
                        const zIndex2 = cos2 > 0 ? 10 : 0;
                        const opacity2 = cos2 * 0.5 + 0.5;
                        const isForeground2 = cos2 > -0.2;

                        gsap.set(item2, {
                            x: sin2 * HELIX_AMP,
                            scale: scale2,
                            opacity: 0.3 + opacity2 * 0.7,
                            zIndex: zIndex2,
                        });

                        if (img2 && isForeground2 !== prevForeground2[i]) {
                            prevForeground2[i] = isForeground2;
                            img2.style.filter = isForeground2 ? 'none' : 'brightness(0) invert(1)';
                        }
                    }
                }
            }

            const drawPath = (points: { x: number; y: number }[]) => {
                if (points.length === 0) return '';
                return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
            };

            if (path1) path1.setAttribute('d', drawPath(points1));
            if (path2) path2.setAttribute('d', drawPath(points2));
            if (path1Pulse) path1Pulse.setAttribute('d', drawPath(points1));
            if (path2Pulse) path2Pulse.setAttribute('d', drawPath(points2));
        };

        // Initial update
        updateStrands();
        updateStrands();

        // Scroll-driven animation
        gsap.to(time, {
            value: Math.PI * 4,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
            },
            onUpdate: updateStrands,
        });

        // Pulse animation
        gsap.to(['#about-helix-path-1-pulse', '#about-helix-path-2-pulse'], {
            strokeDashoffset: -600,
            duration: 4,
            repeat: -1,
            ease: 'linear',
        });

        // Scroll-driven yoyo scale: oscillates between 2.5 and 1 as you scroll
        const scaleProgress = { value: 0 };
        gsap.to(scaleProgress, {
            value: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5,
            },
            onUpdate: () => {
                if (!helixContainerRef.current) return;
                // Sine wave creates the yoyo pulse: oscillates ~3 full cycles over the page scroll
                const sine = Math.sin(scaleProgress.value * Math.PI * 6);
                // Map sine (-1 to 1) → scale (1.0 to 2.5)
                const scale = 1.0 + ((sine + 1) / 2) * 1.5;
                gsap.set(helixContainerRef.current, { scale });
            },
        });

    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            id="about"
            className="bg-black relative overflow-hidden"
            aria-labelledby="about-heading"
        >
            <Container>
                <div className="relative z-10 grid grid-cols-1 desktop:grid-cols-12 gap-12 desktop:gap-8">

                    {/* ── Left Column: Text Content ── */}
                    <div className="desktop:col-span-7 flex flex-col justify-center">

                        {/* Section label */}
                        <div className="flex items-center gap-3 mb-10">
                            <span className="text-zinc-500 text-xs uppercase tracking-[0.25em] font-semibold">About</span>
                        </div>


                        {/* Headline */}
                        <h2
                            id="about-heading"
                            className="text-[clamp(24px,4.5vw,40px)] font-normal leading-[1.15] tracking-tight text-zinc-500 mb-10 w-[100%]"
                        >
                            <strong className="text-white font-black">Hi.</strong> I&apos;ve been building for{' '}
                            <span className="text-[#0158ff]">15 years. </span>

                            I work with{' '}
                            <strong className="text-white font-black">exceptional creatives</strong>{' '}
                            and <strong className="text-white font-black">major brands. </strong>

                            I make things that are{' '}
                            <span className="text-[#0158ff]">beautiful</span> and{' '}
                            <span className="text-[#0158ff]">fast. </span>

                            Now I also build with{' '}
                            <strong className="text-white font-black">AI automation.</strong>

                            <span className="text-gradient-flow"> I&apos;m available for new work.</span>
                        </h2>

                        {/* Body copy */}
                        <p className="text-sm md:text-[15px] leading-relaxed text-zinc-400 font-medium max-w-lg mb-10">
                            For the past <strong className="text-white font-bold">15 years</strong>, I&apos;ve worked with exceptional creatives, crafting beautiful, high-performing
                            digital products for <strong className="text-white font-bold">major brands</strong>. I genuinely love the intersection of{' '}
                            <strong className="text-white font-bold">design, code, and AI</strong>.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex items-center gap-4">

                            <a
                                href="#footer"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 text-white text-sm font-medium rounded-sm hover:border-zinc-500 hover:bg-white/5 transition-all duration-200"
                            >
                                Book a call
                            </a>
                        </div>
                    </div>

                    {/* ── Right Column: Vertical Helix (like LogoTicker) ── */}
                    <div className="desktop:col-span-5 relative hidden desktop:flex items-center justify-center">
                        <div
                            ref={helixContainerRef}
                            className="relative w-full"
                            style={{ height: '750px', transform: 'rotate(-12deg)', transformOrigin: 'center center' }}
                        >
                            {/* "TECH STACK" label */}
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-semibold whitespace-nowrap">
                                Tech Stack
                            </span>

                            {/* SVG paths */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                <defs>
                                    <linearGradient id="about-helix-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#60a9ff" />
                                        <stop offset="25%" stopColor="#6500ff" />
                                        <stop offset="50%" stopColor="#006aff" />
                                        <stop offset="75%" stopColor="#0900b3" />
                                        <stop offset="100%" stopColor="#076dff" />
                                    </linearGradient>
                                </defs>
                                <path id="about-helix-path-1" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                <path id="about-helix-path-2" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                <path id="about-helix-path-1-pulse" fill="none" stroke="url(#about-helix-grad)" strokeWidth="2" strokeOpacity="1" strokeDasharray="20 280" />
                                <path id="about-helix-path-2-pulse" fill="none" stroke="url(#about-helix-grad)" strokeWidth="2" strokeOpacity="1" strokeDasharray="20 280" />
                            </svg>

                            {/* Helix Items — vertical layout */}
                            <div className="absolute inset-0 flex flex-col justify-between py-10">
                                {strand1.map((tool, i) => (
                                    <div key={i} className="relative w-full flex items-center justify-center h-0">
                                        {/* Connecting Line */}
                                        <div className="about-helix-line absolute h-[1px] bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                                        {/* Strand 1 node */}
                                        <AboutHelixItem tool={tool} className="about-strand-1" />

                                        {/* Strand 2 node */}
                                        {strand2[i] && (
                                            <AboutHelixItem tool={strand2[i]} className="about-strand-2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
