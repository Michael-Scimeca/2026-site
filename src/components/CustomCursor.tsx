"use client";

import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const isPointer = useRef(false);

    // Current interpolated state
    const pos = useRef({ x: 0, y: 0, size: 10 });

    useEffect(() => {
        // Disable on touch devices
        if (window.matchMedia("(pointer: coarse)").matches) return;

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

            const target = e.target as HTMLElement;
            const isTicTacToe = target.closest('.tic-tac-toe-board');
            isPointer.current = !isTicTacToe && (
                window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'BUTTON' ||
                target.tagName === 'A'
            );
        };

        window.addEventListener("resize", setupCanvas);
        window.addEventListener("mousemove", onMouseMove);
        setupCanvas();

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Determine Target State
            const targetX = mouse.current.x;
            const targetY = mouse.current.y;
            const targetSize = isPointer.current ? 44 : 10; // Radius 22 -> Dia 44, Radius 5 -> Dia 10

            // Lerp Physics
            const lerp = 0.15;
            pos.current.x += (targetX - pos.current.x) * lerp;
            pos.current.y += (targetY - pos.current.y) * lerp;
            pos.current.size += (targetSize - pos.current.size) * lerp;

            // Draw
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.beginPath();
            ctx.arc(pos.current.x, pos.current.y, pos.current.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = "#0158ff";
            ctx.fill();

            // Border logic when expanded
            if (pos.current.size > 10) {
                ctx.shadowBlur = 0; // Disable shadow for border to keep it sharp
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.lineWidth = 1;
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
