"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface BookCallButtonProps {
    onClick?: () => void;
    label?: string;
    color?: string;
    blobSize?: number;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
}

// Parse hex color to [r,g,b]
function parseColor(color: string): [number, number, number] {
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
        ];
    }
    return [1, 88, 255]; // default blue
}

/**
 * "Book a Call" button — gooey blob background + avatar connection animation.
 * Default: single white dot + label with liquid blob background.
 * On hover: dot expands into two person icons with "+" between them.
 */
export function BookCallButton({
    onClick,
    label = "Book Strategy Call",
    color = "#0158ff",
    blobSize = 26,
    onMouseEnter,
    onMouseLeave,
}: BookCallButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -200, y: -200 });
    const animatedPos = useRef({ x: -200, y: -200 });
    const isHoveredRef = useRef(false);
    const blobScale = useRef(0);
    const rafRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

    const pad = 20;

    // Observe container size
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDimensions({ w: Math.ceil(width), h: Math.ceil(height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Canvas gooey blob animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.w === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const cw = dimensions.w + pad * 2;
        const ch = dimensions.h + pad * 2;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const [cr, cg, cb] = parseColor(color);
        const blurRadius = 10;
        const threshold = 140;
        const borderRadius = dimensions.h / 2;

        const draw = () => {
            const pw = cw * dpr;
            const ph = ch * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Lerp animated position toward mouse
            animatedPos.current.x += (mousePos.current.x - animatedPos.current.x) * 0.18;
            animatedPos.current.y += (mousePos.current.y - animatedPos.current.y) * 0.18;

            // Animate blob scale
            const targetScale = isHoveredRef.current ? 1 : 0;
            blobScale.current += (targetScale - blobScale.current) * 0.12;

            // Clear
            ctx.clearRect(0, 0, pw, ph);

            // Apply blur
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.fillStyle = "#000";

            // Draw pill
            ctx.beginPath();
            ctx.roundRect(pad, pad, dimensions.w, dimensions.h, borderRadius);
            ctx.fill();

            // Draw blob circle
            if (blobScale.current > 0.01) {
                const r = blobSize * blobScale.current;
                ctx.beginPath();
                ctx.arc(
                    animatedPos.current.x + pad,
                    animatedPos.current.y + pad,
                    r,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            // Reset filter
            ctx.filter = "none";

            // Read pixels → threshold alpha → recolor
            const imageData = ctx.getImageData(0, 0, pw, ph);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > threshold) {
                    data[i] = cr;
                    data[i + 1] = cg;
                    data[i + 2] = cb;
                    data[i + 3] = 255;
                } else {
                    data[i + 3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [dimensions, color, blobSize, pad]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        mousePos.current.x = e.clientX - rect.left;
        mousePos.current.y = e.clientY - rect.top;
    }, []);

    const handleEnter = useCallback(
        (e: React.MouseEvent) => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mousePos.current = { x, y };
            animatedPos.current = { x, y };
            isHoveredRef.current = true;
            setIsHovered(true);
            onMouseEnter?.(e);
        },
        [onMouseEnter]
    );

    const handleLeave = useCallback(
        (e: React.MouseEvent) => {
            isHoveredRef.current = false;
            setIsHovered(false);
            onMouseLeave?.(e);
        },
        [onMouseLeave]
    );

    return (
        <div
            ref={containerRef}
            className="relative inline-block cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {/* Canvas gooey background */}
            <canvas
                ref={canvasRef}
                className="absolute pointer-events-none"
                style={{
                    width: (dimensions.w || 0) + pad * 2,
                    height: (dimensions.h || 0) + pad * 2,
                    top: -pad,
                    left: -pad,
                }}
            />

            {/* Button content */}
            <button
                onClick={onClick}
                className="relative z-10 inline-flex items-center rounded-full cursor-pointer"
                style={{
                    padding: "14px 28px",
                    gap: isHovered ? "12px" : "16px",
                    background: "transparent",
                    border: "none",
                    transition: "gap 0.5s ease-out",
                }}
            >
                {/* Icon area — dot morphs to avatars */}
                <div
                    className="relative flex items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                        width: isHovered ? 64 : 10,
                        height: isHovered ? 20 : 10,
                    }}
                >
                    {/* Single dot — default state */}
                    <div
                        className="absolute rounded-full bg-white transition-all duration-400"
                        style={{
                            width: 10,
                            height: 10,
                            opacity: isHovered ? 0 : 1,
                            transform: `scale(${isHovered ? 0.5 : 1})`,
                        }}
                    />

                    {/* Avatars — hover state */}
                    <div
                        className="absolute flex items-center gap-[5px] transition-all duration-500"
                        style={{
                            opacity: isHovered ? 1 : 0,
                            transform: `scale(${isHovered ? 1 : 0.6})`,
                        }}
                    >
                        {/* Person 1 — outline/white */}
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M6.5 21v-1.5a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5V21" />
                        </svg>

                        {/* Plus sign */}
                        <span
                            className="text-[13px] font-medium leading-none"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                            +
                        </span>

                        {/* Person 2 — real avatar photo */}
                        <img
                            src="/button/avatr.png"
                            alt=""
                            width={20}
                            height={20}
                            className="rounded-full object-cover"
                            style={{ width: 20, height: 20 }}
                        />
                    </div>
                </div>

                {/* Label */}
                <span
                    className="text-[15px] lg:text-lg font-medium tracking-wide whitespace-nowrap text-white"
                >
                    {label}
                </span>
            </button>
        </div>
    );
}
