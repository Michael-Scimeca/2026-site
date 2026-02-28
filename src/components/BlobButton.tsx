"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";

interface BlobButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit";
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

export function BlobButton({
    children,
    href,
    onClick,
    className = "",
    target,
    rel,
    type = "button",
    color = "#0158ff",
    blobSize = 26,
    onMouseEnter: externalMouseEnter,
    onMouseLeave: externalMouseLeave,
}: BlobButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -200, y: -200 });
    const animatedPos = useRef({ x: -200, y: -200 });
    const isHovered = useRef(false);
    const blobScale = useRef(0);
    const rafRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

    // Extra padding around the pill so the blob can bulge outward
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

    // Canvas animation loop
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

            // Animate blob scale (smooth in/out)
            const targetScale = isHovered.current ? 1 : 0;
            blobScale.current += (targetScale - blobScale.current) * 0.12;

            // Clear
            ctx.clearRect(0, 0, pw, ph);

            // Apply blur
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.fillStyle = "#000";

            // Draw pill (offset by padding)
            ctx.beginPath();
            ctx.roundRect(pad, pad, dimensions.w, dimensions.h, borderRadius);
            ctx.fill();

            // Draw blob circle (offset by padding)
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

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mousePos.current = { x, y };
        animatedPos.current = { x, y };
        isHovered.current = true;
        externalMouseEnter?.(e);
    }, [externalMouseEnter]);

    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        isHovered.current = false;
        externalMouseLeave?.(e);
    }, [externalMouseLeave]);

    const Tag = href ? "a" : "button";
    const tagProps = href
        ? { href, target, rel }
        : { type, onClick };

    return (
        <div
            ref={containerRef}
            className={`relative inline-block cursor-pointer ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Canvas gooey background — extends beyond container via negative margin */}
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
            {/* Button content on top */}
            <Tag
                {...(tagProps as any)}
                className="relative z-10 inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium text-lg text-white whitespace-nowrap"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
                {children}
            </Tag>
        </div>
    );
}
