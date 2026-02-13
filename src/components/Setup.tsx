"use client";

import React, { useRef } from "react";
import { Container } from "@/components/Container";
import Image from "next/image";
import { SweetPunkText } from "@/components/SweetPunkText";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface SetupItem {
    id: string;
    company: string;
    description: string;
    logo?: string;
    tools?: string[];
    themeColor?: string;
}

const setupItems: SetupItem[] = [
    {
        id: "optimum-nutrition",
        company: "Optimum Nutrition",
        description: "I contributed to the development of the Optimum Nutrition website (optimumnutrition.com), teaming up with We Can’t Stop Thinking to implement front-end features, responsive layouts, and interactive enhancements. My work helped bring design concepts to life while ensuring the site performed reliably across devices and reflected Optimum Nutrition’s strong, performance-driven brand presence.",
        logo: "/logos/on.png",
        tools: ["Photoshop", "Custom CMS", "Browserstack", "Foundation Framework"],
        themeColor: "#3c468c" // Blue
    },
    {
        id: "68ventures",
        company: "68 Ventures",
        description: "I handled the front-end development for the 68 Ventures website, translating the design into a fully responsive, polished online experience. My work focused on implementing clean structure, interactive elements, and performance-oriented code to support the firm’s dynamic brand presence and clearly communicate their investment focus.",
        logo: "/logos/78venatures.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework"],
        themeColor: "#ef4444" // Red
    },
    {
        id: "flipboard",
        company: "Flipboard",
        description: "I provided front-end development and animation implementation for Flipboard’s website, supporting a responsive, engaging online presence.",
        logo: "/logos/flipboard-logo.png",
        tools: ["Custom SCSS", "Foundation Framework", "Javascript Interactions", "Browserstack"],
        themeColor: "#ef4444" // Red
    },
    {
        id: "snickers",
        company: "Snickers",
        description: "One Million SNICKERS was a campaign website created to celebrate the brand in an exciting, playful, and highly interactive way. Snickers came to us with the challenge of building a digital experience that felt fun, bold, and instantly engaging. I contributed to the website development and interactive execution, helping bring the concept to life through dynamic visuals, responsive layouts, and engaging interactions that reinforced Snickers’ energetic, irreverent brand personality.",
        logo: "/logos/snickers.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework", "Gsap"],
        themeColor: "#f59e0b" // Amber
    },
    {
        id: "nycpride",
        company: "NYC Pride",
        description: "I worked as part of RSQ on building the NYC Pride website, contributing to development and implementation to ensure the site launched successfully in time for Pride Day. The work focused on delivering a responsive, accessible, and visually engaging experience under a fixed deadline, supporting one of New York City’s most high-profile annual events and its large, diverse audience.",
        logo: "/logos/nycpride.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework", "Gsap"],
        themeColor: "#f59e0b" // Amber
    },
    {
        id: "seiu",
        company: "SEIU",
        description: "Service Employees International Union (SEIU) is one of North America’s largest labor unions, representing millions of workers across healthcare, public services, and property services. I contributed development support on SEIU.org, working on site updates that helped clearly present the organization’s goals, mission, and key initiatives, ensuring core messaging was accessible, well-structured, and aligned with SEIU’s advocacy efforts.",
        logo: "/logos/seiu.png",
        tools: ["Wordpress", "Browserstack", "Foundation Framework"],
        themeColor: "#a855f7" // Purple
    },
    {
        id: "foo",
        company: "Foosackly's",
        description: "Foosackly’s is a fast-growing restaurant brand with a strong, recognizable personality. For this project, the goal was to modernize the website’s visual direction while ensuring the work could be cleanly handed off to another developer for full implementation.\n\n We developed a new website theme entirely through CSS, using it as both a visual system and technical guide for the future site build. Rather than rebuilding the website end- to - end, the focus was on creating a flexible, well - structured theme layer that another developer could easily pick up and extend.",
        logo: "/logos/foo.png",
        tools: ["Photoshop", "Custom SCSS Guide"],
        themeColor: "#4f46e5" // Indigo
    },
    {
        id: "gabbanelli",
        company: "Gabbanelli",
        description: "Gabbanelli is a heritage brand known for handcrafted silver, jewelry, and premium gifts. I collaborated with the agency We Can’t Stop Thinking to support the Gabbanelli.com website, handling visual asset preparation and contributing to the overall website design.\n\n Similar to my work on Optimo, this project focused on cutting and isolating product imagery, refining visual assets for web use, and designing layouts that highlighted craftsmanship and material detail. Assets were carefully prepared and organized to ensure consistency across the site and allow for a smooth transition between designers as the project evolved.",
        logo: "/logos/gab.png",
        tools: ["Photoshop"],
        themeColor: "#c11427" // Deep Red (Gabbanelli theme)
    },
    {
        id: "nether-realm",
        company: "Nether Realm",
        description: "NetherRealm Studios, creators of the iconic Mortal Kombat franchise, are known for bold visuals, cinematic intensity, and unmistakable atmosphere. I collaborated with the agency We Can’t Stop Thinking to design a 6-page website and blog experience, with the goal of staying as close as possible to the essence of Mortal Kombat.\n\nThe design focused on immediate recognition — creating an experience where the moment you land on the site, you feel Mortal Kombat. Dark, high-contrast visuals, dramatic typography, and cinematic pacing were used to echo the franchise’s intensity, lore, and legacy, while still supporting a clear, modern web experience.",
        logo: "/logos/nether.png",
        tools: ["Photoshop"],
        themeColor: "#f7973b" // Orange/Mortal Kombat themed
    },
    {
        id: "optimo",
        company: "Optimo",
        description: "Optimo is a premium hat brand known for exceptional craftsmanship and timeless design. I teamed up with the agency We Can’t Stop Thinking to support the Shop Optimo e-commerce experience, creating and organizing digital assets while ensuring a seamless handoff to additional designers as the project evolved.",
        logo: "/logos/logo-hat.png",
        tools: ["Photoshop"],
        themeColor: "#14b8a6" // Teal
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

function SetupRow({ item, isLast }: { item: SetupItem; isLast?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pulseRef = useRef<SVGPathElement>(null);

    const pulseLength = React.useMemo(() => getPseudoRandom(item.id + 'pulse', 40, 150), [item.id]);
    const cycleLength = 2000;

    useGSAP(() => {
        if (pulseRef.current) {
            gsap.fromTo(pulseRef.current,
                { strokeDashoffset: 0 },
                {
                    strokeDashoffset: -cycleLength,
                    duration: 4 + (pulseLength / 100),
                    repeat: -1,
                    ease: "linear"
                }
            );
        }
    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="group w-full transition-colors relative py-8 desktop:py-8 overflow-visible"
        >
            {/* Helix-Style Dual-Layer Bottom Border - Dash Pulse Animation */}
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
                        stroke={item.themeColor || '#0158ff'}
                        strokeWidth="1.5"
                        strokeDasharray={`${pulseLength} ${cycleLength - pulseLength}`}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            filter: `drop-shadow(0 0 4px ${item.themeColor || '#0158ff'})`
                        }}
                    />
                </svg>
            </div>

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
                    background: item.id === 'nycpride'
                        ? 'linear-gradient(to bottom, #ef4444, #3b82f6, #a855f7)'
                        : (item.themeColor || '#0158ff'),
                    boxShadow: item.id === 'nycpride'
                        ? `0 0 20px 2px #3b82f680`
                        : `0 0 20px 2px ${item.themeColor || '#0158ff'}80`
                }}
            />

            <Container className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-y-6 md:gap-x-6 items-center">
                    {/* Left: Logo & Company Name */}
                    <div className="flex items-center justify-center md:justify-start">
                        {item.logo && (
                            <div className="relative w-20 h-10 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center">
                                <img
                                    src={`${item.logo}?v=2`}
                                    alt={`${item.company} Logo`}
                                    loading="lazy"
                                    className="w-full h-full object-contain brightness-0 invert opacity-100 transition-opacity duration-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right: Description & Tools */}
                    <div className="flex flex-col justify-center gap-6">
                        {item.description.split('\n\n').map((paragraph, i) => (
                            <div key={i} className="text-sm leading-relaxed font-medium">
                                <SweetPunkText
                                    text={paragraph}
                                    startColor="#52525b"
                                    midColor={item.id === 'nycpride' ? '#ef4444' : (item.themeColor || '#0158ff')}
                                    endColor="#ffffff"
                                    colorDuration={2.0}
                                    stagger={0.005}
                                    enableMotion={false}
                                />
                            </div>
                        ))}

                        {item.tools && item.tools.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
                                {item.tools.map((tool, index) => (
                                    <div key={tool} className="flex items-center gap-x-3">
                                        {index !== 0 && (
                                            <span
                                                className="text-[10px] font-bold"
                                                style={{
                                                    color: item.id === 'nycpride'
                                                        ? ['#ef4444', '#3b82f6', '#a855f7'][(index - 1) % 3]
                                                        : (item.themeColor || '#0158ff')
                                                }}
                                            >
                                                ⌁
                                            </span>
                                        )}
                                        <SweetPunkText
                                            text={tool}
                                            className="text-[10px] uppercase font-bold tracking-wider whitespace-nowrap"
                                            startColor="#52525b"
                                            midColor={item.id === 'nycpride' ? '#ef4444' : (item.themeColor || '#0158ff')}
                                            endColor="#52525b"
                                            colorDuration={2.0}
                                            stagger={0.005}
                                            enableMotion={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export function Setup() {
    return (

        <section className="bg-black text-white relative">
            <div className="flex flex-col">
                {setupItems.map((item, index) => (
                    <SetupRow
                        key={item.id}
                        item={item}
                        isLast={index === setupItems.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
