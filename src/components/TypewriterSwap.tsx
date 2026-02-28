"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface TypewriterSwapProps {
    defaultText: string;
    hoverText: string;
    /** Is the parent element hovered? Controls the swap direction. */
    isHovered: boolean;
    /** Milliseconds per character when erasing (default: 40) */
    eraseSpeed?: number;
    /** Milliseconds per character when typing (default: 60) */
    typeSpeed?: number;
    /** Pause (ms) between erase and retype (default: 120) */
    pauseMs?: number;
    className?: string;
}

/**
 * TypewriterSwap — erase → retype driven by `isHovered` prop.
 *
 * isHovered=true  → erases `defaultText` char-by-char, then types `hoverText`.
 * isHovered=false → erases `hoverText`, then retypes `defaultText`.
 *
 * If isHovered flips rapidly, the current animation is cancelled
 * and the *next* target is queued — no double-firing, no jumpy
 * resets, just smooth erase → retype every time.
 */
export function TypewriterSwap({
    defaultText,
    hoverText,
    isHovered,
    eraseSpeed = 40,
    typeSpeed = 60,
    pauseMs = 120,
    className = "",
}: TypewriterSwapProps) {
    const [display, setDisplay] = useState(defaultText);
    const cancelRef = useRef<(() => void) | null>(null);
    const targetRef = useRef<string>(defaultText);
    const currentTextRef = useRef<string>(defaultText);
    const isFirstRender = useRef(true);

    // Keep currentTextRef in sync
    useEffect(() => {
        currentTextRef.current = display;
    }, [display]);

    // Core animation: erase current text, then type new text
    const animateTo = useCallback(
        (target: string) => {
            // Cancel any running animation
            if (cancelRef.current) {
                cancelRef.current();
                cancelRef.current = null;
            }

            let cancelled = false;
            cancelRef.current = () => {
                cancelled = true;
            };

            const run = async () => {
                const current = currentTextRef.current;

                // If already showing the target, skip
                if (current === target) return;

                // Phase 1: Erase current text
                for (let i = current.length; i >= 0; i--) {
                    if (cancelled) return;
                    const slice = current.slice(0, i);
                    setDisplay(slice);
                    currentTextRef.current = slice;
                    await new Promise((r) => setTimeout(r, eraseSpeed));
                }

                if (cancelled) return;

                // Pause between erase and type
                await new Promise((r) => setTimeout(r, pauseMs));

                if (cancelled) return;

                // Phase 2: Type target text
                for (let i = 0; i <= target.length; i++) {
                    if (cancelled) return;
                    const slice = target.slice(0, i);
                    setDisplay(slice);
                    currentTextRef.current = slice;
                    await new Promise((r) => setTimeout(r, typeSpeed));
                }

                // Check if the target changed while we were animating
                if (!cancelled && targetRef.current !== target) {
                    animateTo(targetRef.current);
                }
            };

            run();
        },
        [eraseSpeed, typeSpeed, pauseMs]
    );

    // React to isHovered changes
    useEffect(() => {
        // Skip the initial render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const target = isHovered ? hoverText : defaultText;
        targetRef.current = target;
        animateTo(target);
    }, [isHovered, hoverText, defaultText, animateTo]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cancelRef.current) cancelRef.current();
        };
    }, []);

    return (
        <span className={`inline ${className}`}>
            {display}
            <span
                className="inline-block w-[3px] h-[0.9em] bg-[#0158ff] ml-[4px] align-baseline rounded-sm"
                style={{
                    animation: "blink 1s step-end infinite",
                }}
            />
        </span>
    );
}
