"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface RotatingWordProps {
    words: string[];
    interval?: number;
    className?: string;
}

export function RotatingWord({
    words,
    interval = 3000,
    className = "",
}: RotatingWordProps) {
    const [index, setIndex] = useState(0);
    const [width, setWidth] = useState<number | undefined>(undefined);
    const measureRef = useRef<HTMLSpanElement>(null);
    const hiddenRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Measure all words once on mount and whenever fonts load
    const measureWord = useCallback(
        (i: number) => {
            const el = hiddenRefs.current[i];
            if (el) return el.offsetWidth;
            return undefined;
        },
        []
    );

    // Set initial width after mount
    useEffect(() => {
        const w = measureWord(0);
        if (w) setWidth(w);
    }, [measureWord]);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => {
                const next = (prev + 1) % words.length;
                // Pre-measure the next word and transition the width
                const nextWidth = measureWord(next);
                if (nextWidth) setWidth(nextWidth);
                return next;
            });
        }, interval);
        return () => clearInterval(timer);
    }, [words.length, interval, measureWord]);

    return (
        <span
            className={`text-[#feaf01] inline-flex overflow-hidden align-bottom relative ${className}`}
            style={{
                height: "1.25em",
                width: width !== undefined ? width : "auto",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Visible animated word */}
            <span
                key={index}
                style={{
                    display: "inline-block",
                    animation: "rwUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                    whiteSpace: "nowrap",
                }}
            >
                {words[index]}
            </span>

            {/* Hidden measurement spans — one per word, invisible but in the DOM for measuring */}
            <span
                ref={measureRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    pointerEvents: "none",
                    top: 0,
                    left: 0,
                    height: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                }}
            >
                {words.map((word, i) => (
                    <span
                        key={word}
                        ref={(el) => {
                            hiddenRefs.current[i] = el;
                        }}
                        style={{
                            display: "inline-block",
                            fontSize: "inherit",
                            fontWeight: "inherit",
                            fontFamily: "inherit",
                            letterSpacing: "inherit",
                        }}
                    >
                        {word}
                    </span>
                ))}
            </span>
        </span>
    );
}
