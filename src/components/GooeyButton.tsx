"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface GooeyButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit";
}

const TRAIL_COUNT = 6;
const LERP_SPEEDS = [0.3, 0.22, 0.16, 0.12, 0.08, 0.05];

let idCounter = 0;

export function GooeyButton({
    children,
    href,
    onClick,
    className = "",
    target,
    rel,
    type = "button",
}: GooeyButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const trailPos = useRef(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
    );
    const rafRef = useRef<number>(0);
    const [circles, setCircles] = useState(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
    );
    const [uniqueId] = useState(() => `gooey-${++idCounter}`);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        mousePos.current.x = e.clientX - rect.left;
        mousePos.current.y = e.clientY - rect.top;
    }, []);

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Snap all trail points to entry position
        for (let i = 0; i < TRAIL_COUNT; i++) {
            trailPos.current[i] = { x, y };
        }
        mousePos.current = { x, y };
        setIsHovered(true);
    }, []);

    useEffect(() => {
        if (!isHovered) return;

        const tick = () => {
            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            for (let i = 0; i < TRAIL_COUNT; i++) {
                const target = i === 0 ? { x: mx, y: my } : trailPos.current[i - 1];
                const lerp = LERP_SPEEDS[i];
                trailPos.current[i].x += (target.x - trailPos.current[i].x) * lerp;
                trailPos.current[i].y += (target.y - trailPos.current[i].y) * lerp;
            }

            setCircles(trailPos.current.map(p => ({ ...p })));
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafRef.current);
    }, [isHovered]);

    const filterId = `${uniqueId}-filter`;
    const maskId = `${uniqueId}-mask`;

    const Tag = href ? "a" : "button";
    const tagProps = href
        ? { href, target, rel }
        : { type, onClick };

    return (
        <div
            ref={containerRef}
            className={`gooey-btn-wrap ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hidden SVG filter + mask */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <filter id={filterId}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -10"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Button background with SVG mask */}
            <div className="gooey-btn-bg">
                <svg width="100%" height="100%" className="gooey-btn-svg">
                    <defs>
                        <mask id={maskId}>
                            {/* White = visible, black = hole */}
                            <rect width="100%" height="100%" fill="white" rx="9999" ry="9999" />
                            <g filter={`url(#${filterId})`}>
                                {isHovered && circles.map((c, i) => (
                                    <circle
                                        key={i}
                                        cx={c.x}
                                        cy={c.y}
                                        r={12 - i * 1.5}
                                        fill="black"
                                    />
                                ))}
                            </g>
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="#0158ff"
                        rx="9999"
                        ry="9999"
                        mask={`url(#${maskId})`}
                    />
                </svg>
            </div>

            {/* Button content */}
            <Tag {...tagProps as any} className="gooey-btn-content">
                {children}
            </Tag>
        </div>
    );
}
