"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface TickerItemProps {
    src: string;
    alt: string;
    color?: string;
    customFilter?: string;
    index: number;
    className?: string;
}

function TickerItem({ src, alt, color, customFilter, index, className }: TickerItemProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const showColor = isHovered;

    return (
        <div
            className={`flex-shrink-0 flex items-center justify-center mx-2 md:mx-5 transition-opacity duration-500 cursor-pointer ${showColor ? 'opacity-100' : 'opacity-50'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={`text-3xl font-light mr-4 transition-colors duration-500 ${showColor ? 'text-zinc-500' : 'text-zinc-700'}`}>[</span>
            <div className="h-8 md:h-10 w-auto flex items-center justify-center relative">
                <Image
                    src={src}
                    alt={alt}
                    width={100}
                    height={40}
                    priority
                    className={`h-full w-auto object-contain transition-all duration-500 ${className || ''}`}
                    style={{
                        filter: showColor
                            ? (customFilter || 'none')
                            : 'brightness(0) invert(1)'
                    }}
                />
            </div>
            <span className={`text-3xl font-light ml-4 transition-colors duration-500 ${showColor ? 'text-zinc-500' : 'text-zinc-700'}`}>]</span>
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
    { name: "Flywheel", src: "/logos/getflywheel-ar21.svg", color: "#48C6DD" },
    { name: "GitHub", src: "/tools/github.svg", color: "#181717", customFilter: 'brightness(0) invert(1)' },
    { name: "n8n", src: "/tools/n8n-color.svg", color: "#FF6584" },
    { name: "Netlify", src: "/tools/Netlify.svg", color: "#00C7B7" },
    { name: "Node.js", src: "/tools/node.js.svg", color: "#339933" },
    { name: "Postman", src: "/tools/postman.svg", color: "#FF6C37" },
    { name: "React", src: "/tools/react.svg", color: "#61DAFB" },
    { name: "Slack", src: "/tools/slack.svg", color: "#4A154B" },
    { name: "Tailwind CSS", src: "/tools/tailwind-css.svg", color: "#06B6D4" },
    {
        name: "TypeScript",
        src: "/tools/typescript.svg",
        color: "#f1dd35",
        customFilter: 'brightness(0) saturate(100%) invert(84%) sepia(48%) saturate(718%) hue-rotate(353deg) brightness(101%) contrast(91%)'
    },
];

const TOOLS_SET = [...TOOLS, ...TOOLS]; // 2 sets, rendered twice = 4 sets total. Enough coverage.

export function LogoTicker() {
    const containerRef = useRef<HTMLElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!innerRef.current) return;

        // Create the infinite scroll animation
        // Move container to -50% (since we render 2 sets of TOOLS_SET)
        const tl = gsap.to(innerRef.current, {
            xPercent: -50,
            ease: "none",
            duration: 60, // Adjust base speed: higher = slower
            repeat: -1
        });

        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const vel = Math.abs(self.getVelocity());
                const boost = vel / 50; // Sensitivity factor

                // Smoothly adjust timeScale
                gsap.to(tl, {
                    timeScale: 1 + boost,
                    duration: 0.5,
                    overwrite: "auto",
                    onComplete: () => {
                        // Return to normal speed
                        gsap.to(tl, { timeScale: 1, duration: 1.0, ease: "power1.out" });
                    }
                });
            }
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="w-full bg-black py-12 md:py-20 overflow-hidden border-b border-white/5">
            <div className="flex w-full overflow-hidden">
                <div ref={innerRef} className="flex w-max whitespace-nowrap" style={{ willChange: "transform" }}>
                    {/* Render TOOLS_SET twice for seamless looping.
                        Set 1 corresponds to 0% -> -50%
                        Set 2 takes over at -50% (which looks like 0%)
                    */}
                    {TOOLS_SET.map((tool, index) => (
                        <TickerItem
                            key={`set1-${tool.name}-${index}`}
                            src={tool.src}
                            alt={tool.name}
                            color={tool.color}
                            customFilter={tool.customFilter}
                            index={index}
                            className={tool.className}
                        />
                    ))}
                    {TOOLS_SET.map((tool, index) => (
                        <TickerItem
                            key={`set2-${tool.name}-${index}`}
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
