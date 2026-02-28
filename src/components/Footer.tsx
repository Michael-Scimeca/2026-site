"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Container } from './Container';
import { useModal } from '@/context/ModalContext';
import { SweetPunkText } from './SweetPunkText';
import { TypewriterSwap } from './TypewriterSwap';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';


gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
    email?: string;
    location?: string;
    socialHandle?: string;
}

export function Footer({ email, location, socialHandle }: FooterProps) {
    const defaultEmail = email || "mikeyscimeca.dev@gmail.com";
    const { openModal } = useModal();
    const videoRef = useRef<HTMLVideoElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);
    const emailLinkRef = useRef<HTMLAnchorElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [footerHovered, setFooterHovered] = useState(false);

    // Proximity-based trigger: flip footerHovered when cursor is near the email link
    useEffect(() => {
        const PROXIMITY_PX = 100;
        const handleMove = (e: MouseEvent) => {
            if (!emailLinkRef.current) return;
            const rect = emailLinkRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
            setFooterHovered(dist < PROXIMITY_PX);
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

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

        if (footerRef.current) observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    // Track actual visibility for rAF loop
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            { threshold: 0.01 }
        );

        if (footerRef.current) observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    // Video scrub — distance to contact section controls progress
    const isInsideRef = useRef(false);
    const targetTimeRef = useRef(0);
    const currentTimeRef = useRef(0);
    const rafIdRef = useRef(0);

    useEffect(() => {
        if (!isFooterVisible) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!emailLinkRef.current || !videoRef.current) return;
            if (!isFinite(videoRef.current.duration)) return;

            const rect = emailLinkRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)
            );

            const radius = 100;

            if (distance < radius) {
                targetTimeRef.current = videoRef.current.duration;
            } else {
                targetTimeRef.current = 0;
            }
        };

        const tick = () => {
            if (videoRef.current && isFinite(videoRef.current.duration) && videoRef.current.readyState >= 2) {
                const diff = targetTimeRef.current - currentTimeRef.current;
                if (Math.abs(diff) > 0.001) {
                    // Slower scrub for natural head movement
                    // Turning toward (scrub in): deliberate, 0.06
                    // Turning back (scrub out): relaxed, 0.04
                    const speed = diff > 0 ? 0.06 : 0.04;
                    currentTimeRef.current += diff * speed;
                    videoRef.current.currentTime = Math.max(0, Math.min(currentTimeRef.current, videoRef.current.duration));
                }
            }
            rafIdRef.current = requestAnimationFrame(tick);
        };

        rafIdRef.current = requestAnimationFrame(tick);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafIdRef.current);
        };
    }, [isFooterVisible]);

    useEffect(() => {
        if (!videoRef.current) return;

        // Initial setup for video
        gsap.set(videoRef.current, { scale: 1.15 });

    }, []);

    // 3D tilt reveal — footer leans back and flattens as you scroll down
    useGSAP(() => {
        if (!footerRef.current) return;

        const spacer = document.getElementById('footer-reveal-spacer');
        if (!spacer) return;

        gsap.set(footerRef.current, {
            rotateX: -10,
            opacity: 0.7,
            transformPerspective: 1200,
            transformOrigin: 'center bottom',
        });

        gsap.to(footerRef.current, {
            rotateX: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: spacer,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 0.5,
            },
        });
    }, { scope: footerRef });

    const renderTextWithThemedPunctuation = (text: string) => {
        return text.split(/([.,])/).map((part, index) => {
            if (part === '.' || part === ',') {
                return (
                    <span key={index} className="text-[#0158ff]">{part}</span>
                );
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    return (
        <footer ref={footerRef} className="fixed bottom-0 left-0 w-full h-screen max-h-screen text-white bg-black flex flex-col overflow-hidden z-0">


            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    src="/videos/footer-gradient-bg.mp4"
                />
            </div>

            <Container className="flex-1 flex flex-col justify-start pt-16 lg:pt-4 lg:justify-center gap-4 md:gap-6 py-4 relative z-10">
                {/* User Provided SVG Mask */}
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <mask id="footer-custom-mask" maskContentUnits="objectBoundingBox">
                            <g transform="scale(0.00212314, 0.00224972)">
                                <path d="M337,0c8.49,1.93,16.43,5.25,22.67,11.84,6.11,6.45,10.25,14.58,10.31,23.64l.14,23.05c.12,20.16,18.44,36.3,38.37,36.4l24.02.13c8.86.05,17.05,3.11,23.99,8.37,8.16,6.18,12.69,14.91,14.51,24.58v282.5c-1.49,8.97-5.09,17.02-12.17,23.4-6.08,5.48-14.2,9.11-22.27,10.06-.29.03-1.09.5-1.05.54H134c-8.49-1.93-16.43-5.25-22.67-11.84s-10.25-14.58-10.31-23.64l-.14-23.05c-.12-20.15-18.43-36.3-38.37-36.4l-24.02-.13c-8.86-.05-17.05-3.11-23.99-8.37-8.16-6.18-12.69-14.91-14.51-24.58V34c0-8.13,5.63-16.39,10.8-21.98C17.66,4.6,26.34,2.09,35.5,0h301.5Z" fill="white" />
                            </g>
                        </mask>
                    </defs>
                </svg>

                {/* Absolute Video - Feathered edges with CSS gradient mask */}
                <div
                    className="absolute bottom-0 -right-[10%] lg:bottom-0 lg:right-0 w-[50vh] h-[45vh] lg:w-[40%] lg:h-[79vh] z-0 opacity-60 md:opacity-80 lg:opacity-100 overflow-hidden pointer-events-none hidden min-[700px]:block bg-transparent"
                    style={{
                        maskImage: 'radial-gradient(56% 64% at 53% 58%, black 69%, transparent 91%)',
                        WebkitMaskImage: 'radial-gradient(56% 64% at 53% 58%, black 69%, transparent 91%)',
                    }}
                >
                    {isInView && (
                        <video
                            ref={videoRef}
                            src="/videos/footer-video-scrub.mp4"
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="relative z-10 w-full">
                    {/* Top Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                        <div className="flex flex-col gap-3 md:gap-6">
                            <h2
                                className="font-bold tracking-tighter leading-none"
                                style={{ fontSize: 'clamp(3rem, 10vw, 8.75rem)', color: '#ffffff' }}
                            >
                                <TypewriterSwap
                                    defaultText="Say Hi"
                                    hoverText="Let's Build"
                                    isHovered={footerHovered}
                                    eraseSpeed={50}
                                    typeSpeed={70}
                                    pauseMs={150}
                                />
                            </h2>
                        </div>
                    </div>

                    {/* Main Content Row */}
                    <div className="w-full lg:w-1/2">
                        {/* Left Side: Text and Links (Now takes full width of its half) */}
                        <div className="flex flex-col gap-4 md:gap-8">
                            <div className="flex flex-col gap-3 md:gap-5">
                                <p className="text-base md:text-lg leading-relaxed text-[#feaf01]">
                                    Ready to build something exceptional? Whether it's an intelligent application, an AI-powered platform, a custom web solution, or an innovative concept that needs technical execution, let's talk. We'll architect it, engineer it, and deploy it together.
                                </p>
                                <p className="text-base md:text-lg text-[#feaf01]">
                                    Let's strategize. Let's innovate. Let's scale.
                                </p>
                            </div>

                            <address className="rounded-xl  overflow-hidden max-w-2xl not-italic" ref={emailRef}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 min-[1160px]:grid-cols-3 gap-x-10">
                                    {/* Email */}
                                    <a
                                        ref={emailLinkRef}
                                        href={`mailto:${defaultEmail}`}
                                        className="group flex flex-col gap-1 p-4 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 transition-all duration-300"
                                    >
                                        <span className="font-bold text-white/50 text-xs uppercase tracking-wider group-hover:text-white/70 transition-colors">Let&apos;s Work Together</span>
                                        <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors text-sm whitespace-nowrap">
                                            <span className="shrink-0 text-base font-bold">@</span>
                                            {defaultEmail}
                                        </span>
                                    </a>

                                    {/* Phone */}
                                    <a
                                        href="tel:+18475089516"
                                        className="group flex flex-col gap-1 p-4 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 transition-all duration-300"
                                    >
                                        <span className="font-bold text-white/50 text-xs uppercase tracking-wider group-hover:text-white/70 transition-colors">Let's Chat</span>
                                        <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors text-sm">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            +1 (847) 508-9516
                                        </span>
                                    </a>

                                    {/* Schedule */}
                                    <button
                                        onClick={openModal}
                                        className="group flex flex-col gap-1 p-4 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 transition-all duration-300 text-left"
                                        aria-label="Book a strategy call"
                                    >
                                        <span className="font-bold text-white/50 text-xs uppercase tracking-wider group-hover:text-white/70 transition-colors">Book a Strategy Call</span>
                                        <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors text-sm">
                                            <svg width="18" height="18" viewBox="0 0 174.01 175.58" fill="currentColor" className="shrink-0">
                                                <rect x="114.01" y="60.64" width="20.65" height="20.73" />
                                                <rect x="54.09" y="117.65" width="20.63" height="20.62" transform="translate(-63.68 192.12) rotate(-89.89)" />
                                                <rect x="54.12" y="60.86" width="20.54" height="20.55" />
                                                <rect x="54.14" y="89.2" width="20.5" height="20.75" />
                                                <rect x="114.13" y="89.3" width="20.54" height="20.51" />
                                                <path d="M117.8,31.82c3.96-.12,7.52-3.08,7.52-8.2l.02-15.57c0-4.73-3.37-7.92-7.46-8.02-4.52-.11-7.79,3.26-7.81,8.05l-.05,15.05c-.02,5.01,2.88,8.84,7.78,8.69Z" />
                                                <path d="M13.4,146.96V49.95s131.97,0,131.97,0l.08,51.03,13.32-.39-.1-71.97c-.01-8.64-7.92-13.45-15.01-13.41l-15.33.09-.15,8.79c-.11,6.4-5.32,10.99-11.11,10.59-6.12-.42-9.9-5.35-9.96-11.52l-.08-7.9-53.45.02.08,8.92c.05,6.02-5.1,10.48-10.66,10.5-5.38.02-10.35-4.6-10.43-10.52l-.12-8.94-19.13.17C7.16,15.45.04,21.12.04,28.11L0,149.01c0,9.02,7.19,14.26,15.45,14.27l83.85.05c.2-6.13.07-11.06-.34-16.42l-85.56.07Z" />
                                                <path d="M42.9,31.85c4.23.01,7.84-2.98,7.84-8.18v-15.59C50.75,3.2,47.38,0,42.99,0c-4.07,0-7.59,3.36-7.58,8.08l.04,15.98c.01,4.67,3.55,7.76,7.44,7.78Z" />
                                                <rect x="84.13" y="60.8" width="20.53" height="20.59" />
                                                <rect x="84.12" y="117.73" width="20.53" height="20.56" />
                                                <polygon points="84.16 89.47 84.17 109.8 104.74 109.64 104.54 89.19 84.16 89.47" />
                                                <rect x="24.11" y="117.73" width="20.58" height="20.53" />
                                                <polygon points="44.61 89.36 24.18 89.31 24.19 109.75 44.67 109.73 44.61 89.36" />
                                                <rect x="24.12" y="60.79" width="20.6" height="20.64" />
                                                <path d="M146.56,120.68c-15.16,0-27.45,12.29-27.45,27.45s12.29,27.45,27.45,27.45,27.45-12.29,27.45-27.45-12.29-27.45-27.45-27.45ZM164.49,158.34c-.59,1.31-3.95,2.19-5.25,1.42l-16.23-9.6-.21-21.96c-.01-1.31,2-3.72,3.26-3.86,1.59-.18,4.13,2,4.14,3.63l.05,18.01,12.17,7.06c1.64.95,2.76,3.77,2.07,5.3Z" />
                                            </svg>
                                            Schedule Time
                                        </span>
                                    </button>

                                    {/* Discord */}
                                    <a
                                        href="https://discord.com/users/michael_scimeca"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col gap-1 p-4 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 transition-all duration-300"
                                    >
                                        <span className="font-bold text-white/50 text-xs uppercase tracking-wider group-hover:text-white/70 transition-colors">Hit Me Up on Discord</span>
                                        <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors text-sm">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                            michaelscimeca
                                        </span>
                                    </a>

                                    {/* LinkedIn */}
                                    <a
                                        href="https://www.linkedin.com/in/mikey-scimeca/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col gap-1 p-4 pl-4 sm:pl-0 border-l-2 sm:border-l-0 border-white/10 transition-all duration-300"
                                        aria-label="LinkedIn Profile"
                                    >
                                        <span className="font-bold text-white/50 text-xs uppercase tracking-wider group-hover:text-white/70 transition-colors">Connect on LinkedIn</span>
                                        <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors text-sm">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                            Michael Scimeca
                                        </span>
                                    </a>
                                </div>
                            </address>
                        </div>
                    </div>

                </div>
            </Container>

            {/* Bottom Bar - Own Block Level */}
            <div className="border-t border-white/10 pt-3 pb-4">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                            <small>© {new Date().getFullYear()} Michael Scimeca</small>
                        </div>

                    </div>
                </Container>
            </div>
        </footer >
    );
}
