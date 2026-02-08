"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SweetPunkTextProps {
    text: string;
    className?: string;
    startColor?: string;
    midColor?: string;
    endColor?: string;
    colorDuration?: number;
    stagger?: number;
    enableMotion?: boolean;
    animate?: boolean;
}

export function SweetPunkText({
    text,
    className = "",
    startColor = "#0158ff",
    midColor,
    endColor = "#ffffff",
    colorDuration = 0.8,
    stagger = 0.02,
    enableMotion = true,
    animate = true
}: SweetPunkTextProps) {
    const containerRef = useRef<HTMLSpanElement>(null);
    const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        if (!animate || !containerRef.current || wordsRef.current.length === 0) return;

        const words = wordsRef.current.filter(Boolean);

        // Reset
        gsap.set(words, {
            y: enableMotion ? 40 : 0,
            opacity: enableMotion ? 0 : 1,
            color: startColor, // Start Color
            rotateX: enableMotion ? -45 : 0,     // Slight tilt for style
            transformOrigin: "0% 50% -50"
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });

        // Motion Transition
        tl.to(words, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: stagger,
            ease: "power3.out"
        }, 0);

        // Color Transition
        if (midColor) {
            // Three-stage color: Start -> Mid -> End
            tl.to(words, {
                keyframes: [
                    { color: midColor, duration: colorDuration * 0.4 }, // Quickly Color
                    { color: endColor, duration: colorDuration * 0.6 }  // Then Fade to White
                ],
                stagger: stagger,
                ease: "power2.inOut"
            }, 0);
        } else {
            // Standard two-stage
            tl.to(words, {
                color: endColor,
                duration: colorDuration,
                stagger: stagger,
                ease: "power2.in"
            }, 0);
        }

        return () => {
            tl.kill();
        };
    }, [text, startColor, midColor, endColor, colorDuration, stagger, enableMotion]);

    // Split text into words, preserving spaces
    const words = text.split(/(\s+)/);

    return (
        <span ref={containerRef} className={`inline-block ${className}`} style={{ perspective: "400px" }}>
            {words.map((word, i) => {
                if (!word) return null;

                // Determine if it's purely whitespace
                const isSpace = /^\s+$/.test(word);
                if (isSpace) {
                    return <React.Fragment key={i}>{word}</React.Fragment>;
                }

                return (
                    <span
                        key={i}
                        ref={(el) => { wordsRef.current[i] = el; }}
                        className="inline-block will-change-transform"
                        style={{
                            opacity: (enableMotion && animate) ? 0 : 1,
                            color: startColor
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </span>
    );
}
