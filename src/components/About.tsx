"use client";

import React, { useRef } from 'react';
import { Container } from './Container';
import { BlobButton } from './BlobButton';
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
            className={`absolute flex items-center justify-center w-11 h-11 bg-black/80 rounded-full border border-white/10 ${className || ''}`}
            data-color={tool.color}
            data-custom-filter={tool.customFilter}
        >
            <Image
                src={tool.src}
                alt={tool.name}
                width={48}
                height={48}
                className="w-3/4 h-3/4 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
            />
        </div>
    );
}

export function About({ description }: AboutProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const helixContainerRef = useRef<HTMLDivElement>(null);
    const contentBlockRef = useRef<HTMLDivElement>(null);

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
        // Batch arrays for gsap.set
        const item1Transforms: { x: number; scale: number; opacity: number; zIndex: number; force3D: boolean }[] = [];
        const item2Transforms: { x: number; scale: number; opacity: number; zIndex: number; force3D: boolean }[] = [];

        const time = { value: 0 };

        // Cache container dimensions (avoids layout reads every frame)
        const containerH = helixContainerRef.current?.offsetHeight || 600;
        const containerW = helixContainerRef.current?.offsetWidth || 200;
        const paddingY = 40;
        const innerHeight = containerH - paddingY * 2;
        const itemCount = items1.length;
        const step = innerHeight / Math.max(itemCount - 1, 1);
        const centerX = containerW / 2;

        const updateStrands = () => {

            const points1: { x: number; y: number }[] = [];
            const points2: { x: number; y: number }[] = [];

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
                    const img1 = strand1Images[i];
                    const img2 = strand2Images[i];

                    if (line) {
                        const width = Math.abs(sin1 * HELIX_AMP * 2);
                        gsap.set(line, {
                            width: width,
                            opacity: width < 5 ? 0 : 0.12,
                        });
                    }

                    // Compute strand 1 transforms
                    const cos1 = Math.cos(angle);
                    const isForeground1 = cos1 > -0.2;
                    item1Transforms[i] = {
                        x: sin1 * HELIX_AMP,
                        scale: cos1 * 0.35 + 0.75,
                        opacity: 0.3 + (cos1 * 0.5 + 0.5) * 0.7,
                        zIndex: cos1 > 0 ? 10 : 0,
                        force3D: true,
                    };

                    if (img1 && isForeground1 !== prevForeground1[i]) {
                        prevForeground1[i] = isForeground1;
                        img1.style.filter = isForeground1 ? 'none' : 'brightness(0) invert(1)';
                    }

                    // Compute strand 2 transforms
                    const cos2 = Math.cos(angle2);
                    const isForeground2 = cos2 > -0.2;
                    item2Transforms[i] = {
                        x: sin2 * HELIX_AMP,
                        scale: cos2 * 0.35 + 0.75,
                        opacity: 0.3 + (cos2 * 0.5 + 0.5) * 0.7,
                        zIndex: cos2 > 0 ? 10 : 0,
                        force3D: true,
                    };

                    if (img2 && isForeground2 !== prevForeground2[i]) {
                        prevForeground2[i] = isForeground2;
                        img2.style.filter = isForeground2 ? 'none' : 'brightness(0) invert(1)';
                    }
                }
            }

            // Batch-apply transforms to strand items
            for (let j = 0; j < items1.length; j++) {
                if (item1Transforms[j] && items1[j]) gsap.set(items1[j], item1Transforms[j]);
                if (item2Transforms[j] && items2[j]) gsap.set(items2[j], item2Transforms[j]);
            }

            // Build SVG path strings
            const drawPath = (points: { x: number; y: number }[]) => {
                if (points.length === 0) return '';
                let d = `M ${points[0].x},${points[0].y}`;
                for (let j = 1; j < points.length; j++) {
                    d += ` L ${points[j].x},${points[j].y}`;
                }
                return d;
            };

            const d1 = drawPath(points1);
            const d2 = drawPath(points2);
            if (path1) path1.setAttribute('d', d1);
            if (path2) path2.setAttribute('d', d2);
            if (path1Pulse) path1Pulse.setAttribute('d', d1);
            if (path2Pulse) path2Pulse.setAttribute('d', d2);
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

        // ── Parallax for left content block ──
        if (contentBlockRef.current) {
            gsap.fromTo(contentBlockRef.current, {
                y: 60,
            }, {
                y: -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }

    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            id="about"
            className="bg-black relative overflow-hidden py-16"
            aria-labelledby="about-heading"
        >
            {/* Moving Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                    src="/videos/footer-gradient-bg.mp4"
                    style={{
                        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)',
                    }}
                />
            </div>

            <Container>
                <div className="relative z-10 grid grid-cols-1 desktop:grid-cols-12 gap-12 desktop:gap-8">

                    {/* ── Left Column: Text Content ── */}
                    <div
                        ref={contentBlockRef}
                        className="desktop:col-span-7 flex flex-col justify-center"
                    >

                        {/* Section label */}
                        <div className="flex items-center gap-3 mb-10">
                            <span className="text-zinc-500 text-xs uppercase tracking-[0.25em] font-semibold">About</span>
                        </div>
                        {/* Headline */}
                        <h2 id="about-heading"
                            className="text-[clamp(24px,4.5vw,40px)] font-normal leading-[1.15] tracking-tight text-zinc-500 mb-10 w-[100%]"
                        >
                            <span className="text-white">Building is in my</span> <span className="text-[#feaf01] font-medium">DNA.</span> <span className='text-white'>For </span> <span className="text-[#feaf01]">15 years</span> <span className='text-white'>I've been obsessed with the <span className="text-[#0158ff]">intersection of design, code, and now AI</span> — not because I have to, but because I genuinely can't stop.</span>

                        </h2>


                        {/* Body copy */}
                        <p className="text-sm md:text-[15px] leading-[1.7] text-zinc-400 font-medium max-w-lg mb-10">
                            From <strong className="text-white font-bold">Patreon</strong> and <strong className="text-white font-bold">Flipboard</strong> to <strong className="text-white font-bold">Snickers</strong> and <strong className="text-white font-bold">Mars, Inc.</strong> — I&apos;ve shipped production work across React, Next.js, GSAP, and headless CMS platforms. Today I also build <strong className="text-white font-bold">AI workflows</strong> with n8n, custom chatbots, and automation systems that save teams hours every week.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex items-center gap-4">

                            <BlobButton href="mailto:mikeyscimeca.dev@gmail.com?subject=Let's Talk Strategy">
                                Email Me<span className="text-xl font-bold">@</span>
                            </BlobButton>

                            <BlobButton href="#footer">
                                Book a Call
                                <Image
                                    src="/Icon/calendar-icons.svg"
                                    alt="Calendar"
                                    width={24}
                                    height={24}
                                />
                            </BlobButton>
                        </div>
                    </div>

                    {/* ── Right Column: Vertical Helix (like LogoTicker) ── */}
                    <div className="desktop:col-span-5 relative hidden desktop:flex items-center justify-center">
                        <div
                            ref={helixContainerRef}
                            className="relative w-full"
                            style={{ height: '750px', transform: 'rotate(-12deg)', transformOrigin: 'center center' }}
                        >
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
