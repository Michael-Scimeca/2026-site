"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

export default function GooeyCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Reset cursor on route change if needed
        const cursor = cursorRef.current;
        const follower = followerRef.current;

        if (!cursor || !follower) return;

        // Ensure visible
        gsap.set([cursor, follower], { xPercent: -50, yPercent: -50, opacity: 1 });

        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;

            // Move the small dot immediately
            gsap.to(cursor, {
                x: clientX,
                y: clientY,
                duration: 0.1,
                ease: "power2.out"
            });

            // Move the goo follower with a delay/elasticity
            gsap.to(follower, {
                x: clientX,
                y: clientY,
                duration: 0.6,
                ease: "power2.out"
            });
        };

        const onMouseEnterLink = () => {
            // Enlarge the follower for hover effect
            gsap.to(follower, { scale: 1.5, duration: 0.3 });
            gsap.to(cursor, { scale: 0.5, duration: 0.3 });
        };

        const onMouseLeaveLink = () => {
            gsap.to(follower, { scale: 1, duration: 0.3 });
            gsap.to(cursor, { scale: 1, duration: 0.3 });
        };

        window.addEventListener('mousemove', onMouseMove);

        // Add hover listeners to clickable elements
        const clickables = document.querySelectorAll('a, button, .cursor-pointer');
        clickables.forEach((el) => {
            el.addEventListener('mouseenter', onMouseEnterLink);
            el.addEventListener('mouseleave', onMouseLeaveLink);
        });

        // Re-add listeners on DOM mutations (simple approach for SPA)
        const observer = new MutationObserver(() => {
            const newClickables = document.querySelectorAll('a, button, .cursor-pointer');
            newClickables.forEach((el) => {
                el.removeEventListener('mouseenter', onMouseEnterLink); // prevent dupes
                el.removeEventListener('mouseleave', onMouseLeaveLink);
                el.addEventListener('mouseenter', onMouseEnterLink);
                el.addEventListener('mouseleave', onMouseLeaveLink);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            clickables.forEach((el) => {
                el.removeEventListener('mouseenter', onMouseEnterLink);
                el.removeEventListener('mouseleave', onMouseLeaveLink);
            });
            observer.disconnect();
        };
    }, [pathname]);

    return (
        <>
            {/* SVG Filter for Gooey Effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* Cursor Elements Container with Filter */}
            <div
                className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] overflow-hidden mix-blend-difference"
                style={{ filter: 'url(#goo)' }}
            >
                {/* The larger, trailing 'goo' part */}
                <div
                    ref={followerRef}
                    className="absolute w-8 h-8 bg-white rounded-full opacity-0"
                    style={{ left: 0, top: 0 }}
                />

                {/* The main sharp dot */}
                <div
                    ref={cursorRef}
                    className="absolute w-4 h-4 bg-white rounded-full opacity-0"
                    style={{ left: 0, top: 0 }}
                />
            </div>
        </>
    );
}
