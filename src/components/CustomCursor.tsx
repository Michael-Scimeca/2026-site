"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const pos = useRef({ x: 0, y: 0, size: 4 });

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

            // Check if hovering over clickable element
            const target = e.target as HTMLElement;
            const isTicTacToe = target.closest('.tic-tac-toe-board');
            const isPointer = !isTicTacToe && (window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'BUTTON' ||
                target.tagName === 'A');

            gsap.to(pos.current, {
                size: isPointer ? 22 : 4,
                duration: 0.3,
                overwrite: true
            });
        };

        window.addEventListener("resize", setupCanvas);
        window.addEventListener("mousemove", onMouseMove);
        setupCanvas();

        let animationFrameId: number;
        pos.current = { x: 0, y: 0, size: 4 };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smoothly follow mouse
            const lerp = 0.2;
            pos.current.x += (mouse.current.x - pos.current.x) * lerp;
            pos.current.y += (mouse.current.y - pos.current.y) * lerp;

            // Draw dot
            ctx.beginPath();
            ctx.arc(pos.current.x, pos.current.y, pos.current.size, 0, Math.PI * 2);
            ctx.fillStyle = "#0158ff";
            ctx.fill();

            // Add a subtle border when expanded
            if (pos.current.size > 5) {
                ctx.strokeStyle = "rgba(1, 88, 255, 0.5)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

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
