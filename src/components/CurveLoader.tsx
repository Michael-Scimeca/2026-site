"use client";

import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function CurveLoader() {
    const loader = useRef<HTMLDivElement>(null);
    const path = useRef<SVGPathElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [displayText, setDisplayText] = useState("");
    const initialCurve = 700;
    const duration = 600;
    const fullText = "Welcome";
    let start: number | undefined;

    // Typewriter Effect
    useEffect(() => {
        let currentIdx = 0;
        const typingInterval = setInterval(() => {
            if (currentIdx <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIdx));
                currentIdx++;
            } else {
                clearInterval(typingInterval);
                // Wait briefly after typing finished, then trigger the curve animation
                setTimeout(() => {
                    requestAnimationFrame(animate);
                }, 500);
            }
        }, 60); // Speed of typing

        return () => clearInterval(typingInterval);
    }, []);

    useLayoutEffect(() => {
        // Lock scroll while loader is active
        document.body.style.overflow = 'hidden';
        window.dispatchEvent(new Event('lenis-stop'));
        setPath(initialCurve);

        return () => {
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('lenis-start'));
        };
    }, []);

    const animate = (timestamp: number) => {
        if (start === undefined) {
            start = timestamp;
        }
        const elapsed = timestamp - start;

        const newCurve = easeOutQuad(elapsed, initialCurve, -initialCurve, duration);
        setPath(newCurve);

        if (loader.current) {
            loader.current.style.top = easeOutQuad(elapsed, 0, -loaderHeight(), duration) + "px";
        }

        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            setIsVisible(false);
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('lenis-start'));
        }
    };

    const easeOutQuad = (time: number, startValue: number, endValue: number, duration: number) => {
        return -endValue * (time /= duration) * (time - 2) + startValue;
    };

    const loaderHeight = () => {
        if (loader.current) {
            return loader.current.getBoundingClientRect().height;
        }
        return 0;
    };

    const setPath = (curve: number) => {
        const width = window.innerWidth;
        const height = loaderHeight();
        if (path.current) {
            path.current.setAttributeNS(
                null,
                "d",
                `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height - curve} 0 ${height} L0 0`
            );
        }
    };

    const pathname = usePathname();

    if (!isVisible) return null;

    // Disable loader on 404 page (any path that isn't root or studio)
    if (pathname !== '/' && !pathname?.startsWith('/studio')) return null;

    return (
        <div
            ref={loader}
            className="fixed top-0 left-0 w-screen z-[9999] bg-transparent pointer-events-none"
            style={{ height: 'calc(100vh + 700px)' }}
        >
            <svg className="w-full h-full fill-black">
                <path
                    ref={path}
                    d="M0 0 L12000 0 L12000 13000 L0 13000 Z"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none">
                <div className="text-white text-4xl md:text-6xl font-medium tracking-tight text-center relative">
                    <span>{displayText}</span>
                    <span className="inline-block w-[2px] h-[0.8em] bg-white ml-1 animate-blink align-middle"></span>
                </div>
            </div>
        </div>
    );
}

export default CurveLoader;
