"use client";

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useModal } from '@/context/ModalContext';

export function FloatingMenu() {
    const [isVisible, setIsVisible] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef<HTMLElement>(null);
    const { openModal } = useModal();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            // Check if at bottom (with small buffer)
            if ((window.innerHeight + currentScrollY) >= document.body.offsetHeight - 20) {
                setIsAtBottom(true);
            } else {
                setIsAtBottom(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav
            ref={menuRef}
            aria-label="Quick actions"
            className={`group fixed right-4 md:right-6 desktop:right-8 top-4 md:top-6 desktop:top-8 z-50 flex flex-col items-center rounded-3xl backdrop-blur-md transition-all duration-500 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            {/* SVG Border Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible rounded-3xl">
                <defs>
                    <linearGradient id="border-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a9ff">
                            <animate attributeName="stop-color" values="#60a9ff;#6500ff;#006aff;#0900b3;#076dff;#60a9ff" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="#6500ff">
                            <animate attributeName="stop-color" values="#6500ff;#006aff;#0900b3;#076dff;#60a9ff;#6500ff" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#006aff">
                            <animate attributeName="stop-color" values="#006aff;#0900b3;#076dff;#60a9ff;#6500ff;#006aff" dur="4s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>
                </defs>
                <rect
                    x="1" y="1"
                    width="calc(100% - 2px)" height="calc(100% - 2px)"
                    rx="23" ry="23"
                    fill="none"
                    stroke="url(#border-glow)"
                    strokeWidth="2"
                />
            </svg>

            {/* Scroll to Top */}
            <button
                onClick={scrollToTop}
                className={`relative z-10 transition-all duration-300 p-2 ${isAtBottom ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-[#838384] hover:text-white'}`}
                aria-label="Scroll to top"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </button>

            {/* Desktop Collapse Indicator (Three Dots) - Hover only, no click state */}
            <div
                className={`hidden md:flex flex-col gap-[3px] overflow-hidden transition-all duration-300 ease-in-out max-h-[40px] pb-3 -mt-[3px] opacity-100 group-hover:max-h-0 group-hover:opacity-0 group-hover:py-0 cursor-pointer ${isExpanded ? '!max-h-0 !opacity-0 !py-0' : ''}`}
            >
                <div className="w-[3px] h-[3px] rounded-full bg-zinc-500"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-zinc-500"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-zinc-500"></div>
            </div>

            {/* Mobile Collapse Indicator (Two Dots) */}
            <div
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`flex md:hidden flex-col gap-[4px] -mt-3 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-0 opacity-0 p-0 pointer-events-none' : 'max-h-[40px] opacity-100 p-4'}`}
            >
                <div className={`w-[3px] h-[3px] rounded-full bg-zinc-500 transition-colors duration-300 ${isExpanded ? 'bg-white' : ''}`}></div>
                <div className={`w-[3px] h-[3px] rounded-full bg-zinc-500 transition-colors duration-300 ${isExpanded ? 'bg-white' : ''}`}></div>
                <div className={`w-[3px] h-[3px] rounded-full bg-zinc-500 transition-colors duration-300 ${isExpanded ? 'bg-white' : ''}`}></div>
            </div>

            {/* Collapsible Content */}
            <div className={`flex flex-col items-center overflow-hidden max-h-0 opacity-0 md:group-hover:max-h-[200px] md:group-hover:min-h-[40px] md:group-hover:opacity-100 transition-all duration-300 ease-in-out ${isExpanded ? '!max-h-[200px] !min-h-[40px] !opacity-100' : ''}`}>
                {/* Email (Envelope) */}
                <a
                    href="mailto:mikeyscimeca.dev@gmail.com"
                    className="text-[#838384] hover:text-white transition-colors p-2 relative z-10"
                    aria-label="Email"
                    onClick={() => setIsExpanded(false)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                    </svg>
                </a>

                {/* Schedule */}
                <button
                    onClick={() => { openModal(); setIsExpanded(false); }}
                    className="text-[#838384] hover:text-white transition-colors p-2 relative z-10 cursor-pointer"
                    aria-label="Schedule a call"
                >
                    <img
                        src="/Icon/calendar-icons.svg"
                        alt="Calendar"
                        width={20}
                        height={20}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                    />
                </button>

                {/* Discord */}
                <a
                    href="https://discord.com/users/michael_scimeca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#838384] hover:text-white transition-colors p-2 relative z-10"
                    aria-label="Discord"
                    onClick={() => setIsExpanded(false)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                    </svg>
                </a>
            </div>
        </nav>
    );
}
