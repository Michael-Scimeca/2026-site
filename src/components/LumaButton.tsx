import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface LumaButtonProps {
    title?: string;
    onClick?: () => void;
    href?: string;
    className?: string;
}

export function LumaButton({ title = "Let's Build Something Together", onClick, href, className = "" }: LumaButtonProps) {
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!particlesRef.current) return;

        // Create particles
        const particleCount = 8;
        const particles: HTMLDivElement[] = [];

        // Clear existing particles
        particlesRef.current.innerHTML = '';

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'absolute w-1 h-1 bg-white/40 rounded-full pointer-events-none opacity-0';
            particlesRef.current.appendChild(p);
            particles.push(p);
        }

        // Animate particles
        particles.forEach((p) => {
            gsap.set(p, {
                x: gsap.utils.random(0, 100),
                y: gsap.utils.random(0, 40),
                scale: gsap.utils.random(0.5, 1.5)
            });

            gsap.to(p, {
                x: `+=${gsap.utils.random(-20, 20)}`,
                y: `+=${gsap.utils.random(-10, 10)}`,
                opacity: gsap.utils.random(0.2, 0.6),
                duration: gsap.utils.random(2, 4),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

    }, []);

    const Component = href ? 'a' : 'button';

    return (
        <Component
            ref={buttonRef as any} // Cast for polymorphic ref usage
            href={href}
            onClick={onClick}
            className={`
                relative group flex items-center justify-center gap-3 
                px-8 py-4 rounded-full bg-black/80 backdrop-blur-sm 
                overflow-hidden transition-all duration-300
                hover:scale-105 active:scale-95
                ${className}
            `}
            style={{
                boxShadow: "0 0 20px -5px rgba(255, 255, 255, 0.1)"
            }}
        >
            {/* Rotating Glow Border Container */}
            <div className="absolute inset-0 rounded-full p-[1px] overflow-hidden -z-10">
                {/* The Rotating Gradient */}
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_80deg,rgba(255,255,255,0.8)_180deg,transparent_280deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ animationDuration: '3s' }}
                />
            </div>

            {/* Inner Background (keeps text legible) */}
            <div className="absolute inset-[1px] bg-black rounded-full -z-10" />

            {/* Floating Particles Container */}
            <div ref={particlesRef} className="absolute inset-0 overflow-hidden rounded-full pointer-events-none -z-0" />

            {/* Content w/ Z-Index to stay on top */}
            <div className="relative z-10 flex items-center gap-3">
                <span className="font-medium text-white tracking-wide text-sm md:text-base">
                    {title}
                </span>

                {/* Arrow Icon */}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/70 group-hover:text-white transition-colors duration-300 group-hover:translate-x-1"
                >
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-white blur-xl -z-10 pointer-events-none" />

        </Component>
    );
}
