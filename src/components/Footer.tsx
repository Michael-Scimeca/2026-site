"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Container } from './Container';
import { SweetPunkText } from './SweetPunkText';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { GradientBackground } from './GradientBackground';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
    email?: string;
    location?: string;
    socialHandle?: string;
}

export function Footer({ email, location, socialHandle }: FooterProps) {
    const defaultEmail = email || "mikeyscimeca.dev@gmail.com";
    const videoRef = useRef<HTMLVideoElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [gridDimensions, setGridDimensions] = useState({ cols: 20, count: 400 });

    useEffect(() => {
        if (!footerRef.current) return;

        const calculateGrid = () => {
            const width = footerRef.current!.offsetWidth;
            const height = footerRef.current!.offsetHeight;
            const squareSize = 50; // 50px squares

            const cols = Math.ceil(width / squareSize);
            const rows = Math.ceil(height / squareSize);

            setGridDimensions({ cols, count: cols * rows });
        };

        calculateGrid();
        window.addEventListener('resize', calculateGrid);
        return () => window.removeEventListener('resize', calculateGrid);
    }, []);

    useGSAP(() => {
        if (!gridRef.current) return;

        const squares = gsap.utils.toArray('.reveal-square');
        const spacer = document.getElementById('footer-reveal-spacer');

        if (squares.length === 0 || !spacer) return;

        gsap.to(squares, {
            opacity: 0,
            duration: 0.001, // Instant transition per square
            stagger: {
                amount: 1,
                from: "random",
                grid: [Math.ceil(gridDimensions.count / gridDimensions.cols), gridDimensions.cols],
                ease: "none"
            },
            ease: "none",
            scrollTrigger: {
                trigger: spacer,
                start: "top bottom",
                end: "top top",
                scrub: 1
            }
        });
    }, { scope: footerRef, dependencies: [gridDimensions] });

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

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!emailRef.current || !videoRef.current) return;
            const video = videoRef.current;

            // Ensure video metadata is loaded
            if (!isFinite(video.duration)) return;

            const rect = emailRef.current.getBoundingClientRect();
            const emailX = rect.left + rect.width / 2;
            const emailY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(e.clientX - emailX, 2) + Math.pow(e.clientY - emailY, 2)
            );

            const isSmallScreen = window.innerWidth < 1024;
            const radius = isSmallScreen ? 350 : 600; // Smaller radius for tablet/mobile layouts
            let targetTime = 0;

            if (distance < radius) {
                // progressive ease
                const progress = 1 - (distance / radius);
                const easedProgress = Math.pow(progress, 1.5); // Slight ease-in
                targetTime = easedProgress * video.duration;
            }

            // Smoothly animate the video playhead
            gsap.to(video, {
                currentTime: targetTime,
                duration: 0.6,
                ease: "power2.out",
                overwrite: true
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isInView]);

    useEffect(() => {
        if (!videoRef.current) return;

        // Initial setup for video
        gsap.set(videoRef.current, { scale: 1.15 });

    }, []);

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
        <footer ref={footerRef} className="fixed bottom-0 left-0 w-full min-h-screen text-white bg-black flex flex-col overflow-hidden z-0">
            {/* Reveal Grid Overlay */}
            <div
                ref={gridRef}
                className="absolute inset-0 z-50 grid pointer-events-none h-full w-full"
                style={{
                    gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`
                }}
            >
                {[...Array(gridDimensions.count)].map((_, i) => (
                    <div key={i} className="reveal-square w-full h-full bg-[#0158ff] opacity-100" />
                ))}
            </div>

            <div className="absolute inset-0 hidden lg:block z-0 pointer-events-none">
                <GradientBackground />
            </div>

            <Container className="flex-1 flex flex-col justify-between py-4  relative z-10">
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

                {/* Absolute Video - Now masked with Custom SVG */}
                <div
                    className="absolute -bottom-[5%] -right-[10%] lg:bottom-12 lg:right-0 w-[50vh] h-[45vh] lg:w-[40%] lg:h-[79vh] z-0 opacity-60 md:opacity-80 lg:opacity-100 overflow-hidden pointer-events-none hidden min-[700px]:block bg-transparent"
                    style={{
                        maskImage: 'url(#footer-custom-mask)',
                        WebkitMaskImage: 'url(#footer-custom-mask)',
                        maskSize: 'cover',
                        WebkitMaskSize: 'cover',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                >
                    {isInView && (
                        <video
                            ref={videoRef}
                            src="/video/footer-video.mp4"
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="relative z-10 w-full">
                    {/* Top Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-16 gap-4 md:gap-8">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h2 className="text-5xl md:text-[120px] font-bold tracking-tighter leading-none">
                                <SweetPunkText
                                    text="Say Hi"
                                    startColor="#ffffff"
                                    animate={false}
                                /><SweetPunkText
                                    text=","
                                    startColor="#0158ff"
                                    animate={false}
                                />
                            </h2>
                        </div>
                    </div>

                    {/* Main Content Row */}
                    <div className="w-full lg:w-1/2">
                        {/* Left Side: Text and Links (Now takes full width of its half) */}
                        <div className="flex flex-col gap-6 md:gap-12">
                            <div className="flex flex-col gap-4 md:gap-8">
                                <div className="text-lg md:text-xl leading-relaxed text-gradient-flow">
                                    Ready to build something exceptional? Whether it's an intelligent application, an AI-powered platform, a custom web solution, or an innovative concept that needs technical execution, let's talk. We'll architect it, engineer it, and deploy it together.
                                </div>
                                <div className="text-lg md:text-xl text-gradient-flow">
                                    Let's strategize. Let's innovate. Let's scale.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 min-[1160px]:grid-cols-2 gap-x-12 gap-y-10" ref={emailRef}>
                                <div className="flex flex-col gap-2">
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">Let's Work Together</span>
                                    <a href={`mailto:${defaultEmail}`} className="text-zinc-500 hover:text-white transition-colors text-lg w-fit">
                                        {defaultEmail}
                                    </a>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">Call Me</span>
                                    <a href="tel:+18475089516" className="text-zinc-500 hover:text-white transition-colors text-lg w-fit">
                                        +1 (847) 508-9516
                                    </a>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">Hit Me Up on Discord</span>
                                    <a href="https://discord.com/users/michael_scimeca" className="text-zinc-500 hover:text-white transition-colors text-lg w-fit">
                                        michaelscimeca
                                    </a>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href="https://www.linkedin.com/in/mikey-scimeca/"
                                        className="text-zinc-500 hover:text-white transition-colors w-fit"
                                        aria-label="LinkedIn Profile"
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Container>

            {/* Bottom Bar - Own Block Level */}
            <div className="border-t border-zinc-900/50 py-1">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                            <span>© {new Date().getFullYear()} Michael Scimeca</span>
                        </div>

                    </div>
                </Container>
            </div>
        </footer>
    );
}
