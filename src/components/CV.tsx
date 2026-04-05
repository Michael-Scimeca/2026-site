"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────

const CV_DATA = {
    name: "Michael Scimeca",
    title: "AI-Powered Web Developer",
    subtitle: "Next.js · WordPress · n8n Automation",
    location: "Greater Chicago Area",
    email: "mikeyscimeca.dev@gmail.com",
    linkedin: "https://www.linkedin.com/in/mikey-scimeca/",
    github: "https://github.com/Michael-Scimeca",
    summary:
        "Chicago-based Digital Designer & Full-Stack Developer specializing in building AI-powered, conversion-driven digital experiences for premium brands. I blend design, code, and automation to craft intelligent, high-impact products — having shipped work for Snickers, Twix, NetherRealm Studios (Mortal Kombat), Patreon, Flipboard, and more. Expert in React, Next.js, PHP, JavaScript, and workflow automation using n8n.",
    experience: [
        {
            id: "freelance-now",
            company: "Freelance",
            role: "Web Developer & Graphic Designer",
            dateRange: "Aug 2023 – Present",
            color: "#0158ff",
            bullets: [
                "Building AI-powered web experiences and automation systems for premium clients.",
                "Developing custom Next.js, React, and WordPress solutions with deep animation work.",
                "Implementing n8n workflow automation, custom chatbots, and AI integrations that save teams hours every week.",
                "Delivering end-to-end digital products — from UX strategy to production deployment.",
            ],
        },
        {
            id: "good-giant",
            company: "Good Giant",
            parentCompany: "Formerly Red Square Agency",
            role: "Senior Stack Web Developer",
            dateRange: "Mar 2021 – Apr 2023",
            color: "#feaf01",
            bullets: [
                "Led web solutions through a major agency merger, maintaining quality and velocity across a large client portfolio.",
                "Expert in the WordPress ecosystem — ACF, Custom Post Types, Yoast — building scalable, maintainable CMS architectures.",
                "Built high-performance digital products for brands including Ripco Real Estate, Kovitz Investment Group, and Outleadership.",
                "Championed animation-forward development using GSAP, Lottie, and Lenis scroll.",
            ],
        },
        {
            id: "good-giant-junior",
            company: "Good Giant",
            parentCompany: "Formerly Red Square Agency",
            role: "Junior Developer / Web Designer",
            dateRange: "Apr 2015 – Jul 2021",
            color: "#feaf01",
            bullets: [
                "Drove creative and technical implementation across web and design projects for 6+ years.",
                "Delivered campaign work for major clients including Snickers (1 Million campaign), NFT Twix (Mars Inc.), Patreon, and Flipboard.",
                "Worked across the full stack — HTML/CSS, JavaScript, PHP, WordPress — building responsive, accessible, and performant interfaces.",
                "Won W3 Gold & Silver Awards for the Ripco Real Estate project.",
            ],
        },
        {
            id: "wcst",
            company: "We Can't Stop Thinking",
            role: "Frontend Developer / Web Designer",
            dateRange: "Apr 2013 – Jun 2015",
            color: "#a855f7",
            bullets: [
                "Built responsive web applications in a fast-moving creative agency environment.",
                "Collaborated on backend integration and creative implementation for brands including Optimo and Optimum Nutrition.",
                "Contributed design assets, UX flows, and front-end code across multiple simultaneous projects.",
            ],
        },
        {
            id: "freelance-early",
            company: "Freelance",
            role: "Graphic Designer / Web Developer",
            dateRange: "Apr 2009 – Mar 2014",
            color: "#10b981",
            bullets: [
                "Delivered websites, brand identities, and graphic design work for diverse clients over 5 years.",
                "Built an early foundation across HTML, CSS, JavaScript, PHP, and Adobe Creative Suite.",
                "Developed user-friendly, visually polished web experiences from concept to launch.",
            ],
        },
    ],
    skills: {
        "Frontend Development": [
            "React", "Next.js", "TypeScript", "JavaScript (ES6+)",
            "GSAP / ScrollTrigger", "CSS / SCSS", "Tailwind CSS", "HTML5",
        ],
        "Backend & CMS": [
            "Node.js", "PHP", "WordPress (ACF, CPT, Yoast)", "Sanity CMS",
            "Prismic", "REST APIs", "AJAX", "SPA Architecture",
        ],
        "AI & Automation": [
            "n8n Workflows", "Python", "AI Chatbots", "Robotic Process Automation",
            "Workflow Automation", "Claude / Anthropic API", "Pollinations AI",
        ],
        "Design & Tools": [
            "Figma", "Adobe Photoshop", "Adobe Illustrator",
            "GitHub / Git", "Docker", "Vercel", "Netlify",
            "WP Engine", "Pantheon", "Browserstack",
        ],
        "Analytics & Marketing": [
            "Google Analytics", "SEO", "Email Marketing", "Google Tag Manager",
        ],
    },
    education: [
        {
            school: "TripleTen",
            degree: "Certificate in AI Automation",
            dateRange: "Jul 2025 – Oct 2025",
            color: "#0158ff",
        },
    ],
    awards: [
        {
            title: "W3 Award — Gold",
            project: "Ripco Real Estate",
            org: "W3 Awards",
            color: "#feaf01",
        },
        {
            title: "W3 Award — Silver",
            project: "Ripco Real Estate",
            org: "W3 Awards",
            color: "#a1a1aa",
        },
    ],
    certifications: [
        { name: "AI Automation", org: "TripleTen", color: "#0158ff" },
        { name: "Google Analytics Certified", org: "Google", color: "#feaf01" },
    ],
    notableClients: [
        "Snickers / Mars Inc.", "Twix / Mars Inc.", "Patreon", "Flipboard",
        "NetherRealm Studios", "Outleadership", "Kovitz Investment Group",
        "Ripco Real Estate", "Optimum Nutrition", "NYC Pride", "SEIU",
        "Longview Innovation", "Optimo",
    ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 mb-8">
            <span className="w-5 h-[1px] bg-[#0158ff]" />
            <span className="text-[#0158ff] text-[10px] uppercase tracking-[0.35em] font-bold">
                {label}
            </span>
        </div>
    );
}

function Divider() {
    return (
        <div className="relative my-16 md:my-20">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div
                className="absolute inset-0 h-[1px]"
                style={{
                    background: "linear-gradient(to right, transparent, #0158ff40, transparent)",
                }}
            />
        </div>
    );
}

function ExperienceItem({
    item,
    index,
}: {
    item: (typeof CV_DATA.experience)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!ref.current) return;
        gsap.fromTo(
            ref.current,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 85%",
                    once: true,
                },
            }
        );
    }, { scope: ref });

    return (
        <div
            ref={ref}
            className="group relative pl-6 md:pl-0 md:grid md:grid-cols-12 md:gap-8 pb-12 last:pb-0"
            style={{ opacity: 0 }}
        >
            {/* Left gutter — timeline line */}
            <div className="hidden md:block md:col-span-1 relative">
                <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 z-10 transition-all duration-300 group-hover:scale-150"
                    style={{
                        borderColor: item.color,
                        background: `${item.color}30`,
                        boxShadow: `0 0 12px ${item.color}60`,
                    }}
                />
                {index < CV_DATA.experience.length - 1 && (
                    <div
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-[1px] h-full"
                        style={{
                            background: `linear-gradient(to bottom, ${item.color}40, transparent)`,
                        }}
                    />
                )}
            </div>

            {/* Mobile dot */}
            <div
                className="absolute left-0 top-2 w-2 h-2 rounded-full md:hidden border-2"
                style={{
                    borderColor: item.color,
                    background: `${item.color}30`,
                    boxShadow: `0 0 8px ${item.color}60`,
                }}
            />

            {/* Meta column */}
            <div className="md:col-span-3 mb-4 md:mb-0">
                <p
                    className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                    style={{ color: `${item.color}99` }}
                >
                    {item.dateRange}
                </p>
                <h3 className="text-white font-bold text-base leading-snug">
                    {item.company}
                </h3>
                {item.parentCompany && (
                    <p className="text-zinc-500 text-xs mt-0.5">{item.parentCompany}</p>
                )}
            </div>

            {/* Content column */}
            <div className="md:col-span-8">
                <div className="flex items-start gap-3 mb-4">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border whitespace-nowrap"
                        style={{
                            borderColor: `${item.color}40`,
                            color: item.color,
                            background: `${item.color}10`,
                        }}
                    >
                        {item.role}
                    </span>
                </div>

                <ul className="space-y-2">
                    {item.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
                            <span
                                className="mt-2 w-1 h-1 rounded-full shrink-0"
                                style={{ background: item.color }}
                            />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ─── Main CV Component ────────────────────────────────────────────────────────

export function CV() {
    const heroRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);

    useGSAP(() => {
        if (!nameRef.current) return;

        gsap.fromTo(
            nameRef.current,
            { opacity: 0, y: 30, skewX: -3 },
            { opacity: 1, y: 0, skewX: 0, duration: 1.2, ease: "power4.out", delay: 0.2 }
        );

        const elems = heroRef.current?.querySelectorAll(".cv-hero-item");
        if (elems) {
            gsap.fromTo(
                elems,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.5 }
            );
        }
    }, { scope: heroRef });

    return (
        <main className="bg-black min-h-screen text-white">

            {/* ── Header Nav ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/80 backdrop-blur-md">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Portfolio
                </Link>

                <div className="flex items-center gap-4">
                    <a
                        href={`mailto:${CV_DATA.email}`}
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold text-white border border-white/10 hover:border-[#0158ff] hover:bg-[#0158ff10] transition-all duration-200"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0158ff]" />
                        Hire Me
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.print(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200"
                        aria-label="Print CV"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                        </svg>
                        Print
                    </a>
                </div>
            </nav>

            {/* ── Hero Header ── */}
            <div ref={heroRef} className="relative pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto overflow-hidden">

                {/* Background glow */}
                <div
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{
                        background: "radial-gradient(circle, rgba(1,88,255,0.08) 0%, transparent 70%)",
                    }}
                />

                {/* Eyebrow */}
                <div className="cv-hero-item flex items-center gap-3 mb-6" style={{ opacity: 0 }}>
                    <span className="w-8 h-[1px] bg-[#0158ff]" />
                    <span className="text-[#0158ff] text-[10px] uppercase tracking-[0.35em] font-bold">
                        Curriculum Vitæ
                    </span>
                </div>

                {/* Name */}
                <h1
                    ref={nameRef}
                    className="text-[clamp(42px,8vw,96px)] font-bold leading-[0.95] tracking-tight text-white mb-6"
                    style={{ opacity: 0 }}
                >
                    Michael{" "}
                    <span
                        className="inline-block"
                        style={{
                            background: "linear-gradient(135deg, #0158ff 0%, #feaf01 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Scimeca
                    </span>
                </h1>

                {/* Title */}
                <p className="cv-hero-item text-xl md:text-2xl text-zinc-400 font-medium mb-2" style={{ opacity: 0 }}>
                    {CV_DATA.title}
                </p>
                <p className="cv-hero-item text-sm text-zinc-600 tracking-widest uppercase mb-10" style={{ opacity: 0 }}>
                    {CV_DATA.subtitle}
                </p>

                {/* Contact strip */}
                <div className="cv-hero-item flex flex-wrap gap-3 md:gap-6 text-sm" style={{ opacity: 0 }}>
                    {[
                        {
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            ),
                            label: CV_DATA.location,
                            href: null,
                        },
                        {
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            ),
                            label: CV_DATA.email,
                            href: `mailto:${CV_DATA.email}`,
                        },
                        {
                            icon: (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            ),
                            label: "LinkedIn",
                            href: CV_DATA.linkedin,
                        },
                        {
                            icon: (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            ),
                            label: "GitHub",
                            href: CV_DATA.github,
                        },
                    ].map((item, i) => (
                        item.href ? (
                            <a
                                key={i}
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 group"
                            >
                                <span className="text-[#0158ff] group-hover:text-[#feaf01] transition-colors">{item.icon}</span>
                                {item.label}
                            </a>
                        ) : (
                            <span key={i} className="flex items-center gap-2 text-zinc-500">
                                <span className="text-zinc-600">{item.icon}</span>
                                {item.label}
                            </span>
                        )
                    ))}
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 pb-32">

                {/* Summary */}
                <section aria-label="Professional Summary">
                    <SectionLabel label="Summary" />
                    <p className="text-[15px] md:text-base leading-[1.8] text-zinc-300 max-w-3xl">
                        {CV_DATA.summary}
                    </p>
                </section>

                <Divider />

                {/* Experience */}
                <section aria-label="Work Experience">
                    <SectionLabel label="Experience" />
                    <div className="space-y-10">
                        {CV_DATA.experience.map((item, i) => (
                            <ExperienceItem key={item.id} item={item} index={i} />
                        ))}
                    </div>
                </section>

                <Divider />

                {/* Skills */}
                <section aria-label="Skills">
                    <SectionLabel label="Skills & Technologies" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                        {Object.entries(CV_DATA.skills).map(([category, skills], catIdx) => {
                            const colors = ["#0158ff", "#feaf01", "#a855f7", "#10b981"];
                            const color = colors[catIdx % colors.length];
                            return (
                                <div key={category}>
                                    <h3
                                        className="text-[11px] uppercase tracking-[0.25em] font-bold mb-4"
                                        style={{ color }}
                                    >
                                        {category}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all duration-200 hover:scale-105"
                                                style={{
                                                    borderColor: `${color}30`,
                                                    color: "rgba(228,228,231,0.8)",
                                                    background: `${color}08`,
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <Divider />

                {/* Two-column: Education + Awards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">

                    {/* Education */}
                    <section aria-label="Education">
                        <SectionLabel label="Education" />
                        <div className="space-y-6">
                            {CV_DATA.education.map((edu, i) => (
                                <div key={i} className="group relative pl-5 border-l-2 border-[#0158ff20] hover:border-[#0158ff] transition-colors duration-300">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500 mb-1">
                                        {edu.dateRange}
                                    </p>
                                    <h3 className="text-white font-bold text-base">{edu.school}</h3>
                                    <p className="text-zinc-400 text-sm mt-0.5">{edu.degree}</p>
                                </div>
                            ))}

                            {/* Self-taught note */}
                            <div className="relative pl-5 border-l-2 border-white/5">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-600 mb-1">
                                    2009 – Present
                                </p>
                                <h3 className="text-zinc-300 font-bold text-base">Self-Taught</h3>
                                <p className="text-zinc-500 text-sm mt-0.5">
                                    15+ years building production-grade products through continuous learning, shipping real work, and staying on the cutting edge.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Awards & Certifications */}
                    <section aria-label="Awards and Certifications">
                        <SectionLabel label="Awards & Certifications" />
                        <div className="space-y-4">
                            {CV_DATA.awards.map((award, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] transition-all duration-200"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ background: `${award.color}15`, border: `1px solid ${award.color}40` }}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={award.color} strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{award.title}</p>
                                        <p className="text-zinc-500 text-[12px] mt-0.5">{award.project} · {award.org}</p>
                                    </div>
                                </div>
                            ))}

                            {CV_DATA.certifications.map((cert, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] transition-all duration-200"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}40` }}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{cert.name}</p>
                                        <p className="text-zinc-500 text-[12px] mt-0.5">{cert.org}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <Divider />

                {/* Notable Clients */}
                <section aria-label="Notable Clients">
                    <SectionLabel label="Notable Clients & Projects" />
                    <div className="flex flex-wrap gap-3">
                        {CV_DATA.notableClients.map((client, i) => {
                            const colors = ["#0158ff", "#feaf01", "#a855f7", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];
                            const color = colors[i % colors.length];
                            return (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-[13px] font-medium rounded-full border transition-all duration-200 hover:scale-105"
                                    style={{
                                        borderColor: `${color}25`,
                                        color: "rgba(228,228,231,0.75)",
                                        background: `${color}06`,
                                    }}
                                >
                                    {client}
                                </span>
                            );
                        })}
                    </div>
                </section>

                <Divider />

                {/* Footer CTA */}
                <section className="text-center py-8">
                    <p className="text-zinc-600 text-xs uppercase tracking-[0.3em] mb-6">Ready to work together?</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`mailto:${CV_DATA.email}?subject=Let's Talk Strategy`}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white border border-[#0158ff] hover:bg-[#0158ff] transition-all duration-300"
                        >
                            Email Me
                        </a>
                        <a
                            href={CV_DATA.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-zinc-400 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            Connect on LinkedIn
                        </a>
                    </div>
                    <p className="text-zinc-700 text-xs mt-8">
                        michaelscimeca.com/cv · {CV_DATA.location}
                    </p>
                </section>
            </div>
        </main>
    );
}
