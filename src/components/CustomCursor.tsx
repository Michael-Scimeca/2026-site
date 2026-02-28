"use client";

import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: -100, y: -100 });
    const pos = useRef({ x: -100, y: -100 });
    const velocity = useRef({ x: 0, y: 0 });
    const isPointer = useRef(false);
    const isHovered = useRef(false);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const FOLLOW_SPEED = 0.3;
        const SKEW_AMOUNT = 0.3;
        const MAX_STRETCH = 1.5;

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

        // Hover listeners for interactive elements
        const onMouseEnter = () => { isHovered.current = true; };
        const onMouseLeave = () => { isHovered.current = false; };

        const addHoverListeners = () => {
            document.querySelectorAll("a, button, [role='button']").forEach((el) => {
                el.addEventListener("mouseenter", onMouseEnter);
                el.addEventListener("mouseleave", onMouseLeave);
            });
        };

        const removeHoverListeners = () => {
            document.querySelectorAll("a, button, [role='button']").forEach((el) => {
                el.removeEventListener("mouseenter", onMouseEnter);
                el.removeEventListener("mouseleave", onMouseLeave);
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        addHoverListeners();

        let rafId: number;

        const render = () => {
            const dot = dotRef.current;
            if (!dot) {
                rafId = requestAnimationFrame(render);
                return;
            }

            // Smooth follow
            const prevX = pos.current.x;
            const prevY = pos.current.y;
            pos.current.x += (mouse.current.x - pos.current.x) * FOLLOW_SPEED;
            pos.current.y += (mouse.current.y - pos.current.y) * FOLLOW_SPEED;

            // Calculate velocity
            velocity.current.x = pos.current.x - prevX;
            velocity.current.y = pos.current.y - prevY;

            const speed = Math.sqrt(
                velocity.current.x ** 2 + velocity.current.y ** 2
            );

            // Stretch based on speed
            const stretch = Math.min(1 + speed * SKEW_AMOUNT, MAX_STRETCH);
            const squeeze = 1 / Math.sqrt(stretch); // preserve area

            // Angle of motion
            const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);

            // Size: bigger when hovering interactive elements
            const size = 12;

            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.transform = `
                translate(${pos.current.x - size / 2}px, ${pos.current.y - size / 2}px)
                rotate(${angle}deg)
                scale(${stretch}, ${squeeze})
            `;

            // Subtle opacity shift at high speed
            dot.style.opacity = speed > 0.5 ? "1" : "0.9";

            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            removeHoverListeners();
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={dotRef}
            className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full"
            style={{
                width: 12,
                height: 12,
                backgroundColor: "#0158ff",
                boxShadow: "0 0 4px 1px rgba(0, 20, 120, 0.4)",
                willChange: "transform",
            }}
        />
    );
}
