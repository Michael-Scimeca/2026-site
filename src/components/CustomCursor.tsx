"use client";

import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const pos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const setupCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const onMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        window.addEventListener("resize", setupCanvas);
        window.addEventListener("mousemove", onMouseMove);
        setupCanvas();

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smoothly follow mouse
            const lerp = 0.2;
            pos.current.x += (mouse.current.x - pos.current.x) * lerp;
            pos.current.y += (mouse.current.y - pos.current.y) * lerp;

            // Draw dot
            ctx.beginPath();
            ctx.arc(pos.current.x, pos.current.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#BBDEFB"; // Baby blue
            ctx.fill();

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", setupCanvas);
            window.removeEventListener("mousemove", onMouseMove);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]"
        />
    );
}
