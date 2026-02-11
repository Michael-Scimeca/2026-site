"use client";

import React, { useRef } from 'react';
import { Container } from './Container';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface TickerItemProps {
    src: string;
    alt: string;
    color?: string;
    customFilter?: string;
    index: number;
    className?: string;
}

function TickerItem({ src, alt, color, customFilter, index, className }: TickerItemProps) {
    return (
        <div
            className="group flex-shrink-0 flex items-center justify-center mx-2 md:mx-5 cursor-pointer opacity-100 md:opacity-50 md:hover:opacity-100 transition-opacity duration-500"
        >
            <span className="text-3xl font-light mr-4 transition-colors duration-500 text-zinc-500 md:text-zinc-700 md:group-hover:text-zinc-500">[</span>
            <div className="h-8 md:h-10 w-auto flex items-center justify-center relative">
                <Image
                    src={src}
                    alt={alt}
                    width={100}
                    height={40}
                    priority
                    className={`h-full w-auto object-contain transition-all duration-500 ${className || ''} [filter:var(--custom-filter)] md:[filter:brightness(0)_invert(1)] md:group-hover:[filter:var(--custom-filter)]`}
                    style={{
                        '--custom-filter': customFilter || 'none'
                    } as React.CSSProperties}
                />
            </div>
            <span className="text-3xl font-light ml-4 transition-colors duration-500 text-zinc-500 md:text-zinc-700 md:group-hover:text-zinc-500">]</span>
        </div>
    );
}

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
    { name: "Google Antigravity", src: "/tools/Google_Antigravity-logo_brandlogos.net_e23c83.svg", color: "#4285F4" },
    { name: "Next.js", src: "/tools/Nextjs-logo.svg", color: "#000000", customFilter: 'brightness(0) invert(1)', className: "scale-75" },
    { name: "Docker", src: "/tools/docker.svg", color: "#2496ED" },
    { name: "Figma", src: "/tools/figma.svg", color: "#F24E1E" },
    { name: "Flywheel", src: "/tools/flywheel.svg", color: "#48C6DD" },
    { name: "GitHub", src: "/tools/github.svg", color: "#181717", customFilter: 'brightness(0) invert(1)' },
    { name: "n8n", src: "/tools/n8n-color.svg", color: "#FF6584" },
    { name: "Netlify", src: "/tools/Netlify.svg", color: "#00C7B7" },
    { name: "Node.js", src: "/tools/node.js.svg", color: "#339933" },
    { name: "Postman", src: "/tools/postman.svg?v=2", color: "#FF6C37" },
    { name: "React", src: "/tools/react.svg", color: "#61DAFB" },
    { name: "Slack", src: "/tools/slack.svg", color: "#4A154B" },
    { name: "Tailwind CSS", src: "/tools/tailwind-css.svg", color: "#06B6D4" },
    {
        name: "TypeScript",
        src: "/tools/typescript.svg",
        color: "#f1dd35",
        customFilter: 'brightness(0) saturate(100%) invert(84%) sepia(48%) saturate(718%) hue-rotate(353deg) brightness(101%) contrast(91%)'
    },
    { name: "WordPress", src: "/tools/WordPress_blue_logo.svg", color: "#21759b" },
    { name: "BugHerd", src: "/tools/bugherd.svg", color: "#41CBA8" },
    { name: "Google Analytics", src: "/tools/Logo_Google_Analytics.svg.png", color: "#F9AB00" },
];

const TOOLS_SET = [...TOOLS, ...TOOLS]; // 2 sets (32 items total)

export function LogoTicker() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Target both tracks and move them left by 100% of their width
        // logic: Track 1 moves 0 -> -100%. Track 2 moves 100% (start pos) -> 0%.
        // Reset seamlessly.
        gsap.to(".ticker-track", {
            xPercent: -100,
            ease: "none",
            duration: 60, // Slower duration for smoother look
            repeat: -1,
            force3D: true, // Hardware acceleration
            overwrite: "auto",
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="w-full bg-black py-12 md:py-20 overflow-hidden border-b border-white/5">
            <Container className="mb-8">
                <div className="text-left">
                    <span className="text-[#52525b] text-sm md:text-base block">
                        Tools
                    </span>
                </div>
            </Container>
            <div className="flex w-full overflow-hidden whitespace-nowrap">
                {/* Track 1 */}
                <div className="ticker-track flex-none flex w-max items-center" style={{ willChange: "transform" }}>
                    {TOOLS_SET.map((tool, index) => (
                        <TickerItem
                            key={`t1-${tool.name}-${index}`}
                            src={tool.src}
                            alt={tool.name}
                            color={tool.color}
                            customFilter={tool.customFilter}
                            index={index}
                            className={tool.className}
                        />
                    ))}
                </div>
                {/* Track 2 - Duplicate */}
                <div className="ticker-track flex-none flex w-max items-center" style={{ willChange: "transform" }}>
                    {TOOLS_SET.map((tool, index) => (
                        <TickerItem
                            key={`t2-${tool.name}-${index}`}
                            src={tool.src}
                            alt={tool.name}
                            color={tool.color}
                            customFilter={tool.customFilter}
                            index={index}
                            className={tool.className}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
