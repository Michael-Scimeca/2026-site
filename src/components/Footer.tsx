"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Container } from './Container';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    const [isInView, setIsInView] = useState(false);

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

            const rect = emailRef.current.getBoundingClientRect();
            const emailX = rect.left + rect.width / 2;
            const emailY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(e.clientX - emailX, 2) + Math.pow(e.clientY - emailY, 2)
            );

            const radius = 250;
            if (distance < radius) {
                const duration = videoRef.current.duration;
                if (!duration) return;

                // progress is 0 at radius, 1 at center
                const progress = 1 - (distance / radius);

                // Scrub the video based on distance
                videoRef.current.currentTime = progress * duration;
            } else if (videoRef.current.currentTime !== 0) {
                videoRef.current.currentTime = 0;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);



    return (
        <footer ref={footerRef} className="fixed bottom-0 left-0 w-full bg-black text-white h-screen flex flex-col z-10">
            <Container className="flex-1 flex flex-col justify-between pt-6 md:pt-12 relative z-10">
                {/* Absolute Video - Now inside Container for alignment */}
                <div
                    className="absolute bottom-12 right-0 w-full lg:w-[40%] h-[40vh] lg:h-[60vh] z-0 opacity-80 lg:opacity-100 rounded-[10px] overflow-hidden pointer-events-none hidden lg:block"
                >
                    <div className="grain-overlay rounded-[10px]" />
                    {isInView && (
                        <video
                            ref={videoRef}
                            src="/video/footer-video.mp4"
                            muted
                            playsInline
                            className="w-full h-full object-cover rounded-[10px]"
                        />
                    )}
                </div>

                <div className="relative z-10 w-full">
                    {/* Top Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                        <div className="flex flex-col gap-8">
                            <h2 className="text-7xl md:text-[120px] font-bold tracking-tighter leading-none">
                                Say hi<span className="text-[#0158ff]">,</span>
                            </h2>
                        </div>
                    </div>

                    {/* Main Content Row */}
                    <div className="w-full lg:w-1/2">
                        {/* Left Side: Text and Links (Now takes full width of its half) */}
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col gap-8">
                                <p className="text-zinc-500 text-lg md:text-xl leading-relaxed">
                                    Ready to build something exceptional?
                                    Whether it's an intelligent application, an AI-powered platform, a custom web solution, or an innovative concept that needs technical execution, let's talk. We'll architect it, engineer it, and deploy it together.

                                </p>
                                <p className="text-zinc-500 text-lg md:text-xl">
                                    Let's strategize. Let's innovate. Let's scale.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="flex flex-col gap-2" ref={emailRef}>
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">Let's Work Together</span>
                                    <a href={`mailto:${defaultEmail}`} className="text-zinc-500 hover:text-white transition-colors text-lg">
                                        {defaultEmail}
                                    </a>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="font-bold text-white text-sm uppercase tracking-wider">Hit Me Up on Discord</span>
                                    <a href="https://discord.com/users/michael_scimeca" className="text-zinc-500 hover:text-white transition-colors text-lg">
                                        michaelscimeca
                                    </a>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href="https://www.linkedin.com/in/mikey-scimeca/"
                                        className="text-zinc-500 hover:text-white transition-colors"
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
            <div className="border-t border-zinc-900/50 py-6">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                            <span>© {new Date().getFullYear()} Michael Scimeca</span>
                        </div>

                    </div>
                </Container>
            </div>
        </footer>
    );
}
