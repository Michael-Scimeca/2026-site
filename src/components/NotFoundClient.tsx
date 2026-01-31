"use client";

import Link from 'next/link';
import { GradientBolt } from '@/components/GradientBolt';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

// Use this clean interface
interface NotFoundClientProps {
    // heroData is no longer needed but we keep it optional to avoid breaking parent if it passes it
    heroData?: any;
}

export function NotFoundClient({ heroData }: NotFoundClientProps) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const duration = 20000; // 20 seconds
        const interval = 50; // Update every 50ms
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress((currentStep / steps) * 100);

            if (currentStep >= steps) {
                clearInterval(timer);
                router.push('/');
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    useLayoutEffect(() => {
        if (buttonRef.current) {
            const { offsetWidth, offsetHeight } = buttonRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, []);

    // Calculate path data for a perfect rounded rectangle (pill shape) starting from top center
    const generatePath = (w: number, h: number, stroke: number) => {
        if (w === 0 || h === 0) return "";
        const r = (h - stroke) / 2; // Radius is half of inner height
        const x = stroke / 2;     // Offset for stroke
        const y = stroke / 2;
        const width = w - stroke;
        const height = h - stroke;

        // Path: Top-Center -> Top-Right -> Right-Arc -> Bottom-Left -> Left-Arc -> Top-Center
        return `
            M ${w / 2} ${y}
            L ${w - r - x} ${y}
            A ${r} ${r} 0 0 1 ${w - x} ${y + r}
            A ${r} ${r} 0 0 1 ${w - r - x} ${h - y}
            L ${r + x} ${h - y}
            A ${r} ${r} 0 0 1 ${x} ${h - r - y}
            A ${r} ${r} 0 0 1 ${r + x} ${y}
            Z
        `;
    };

    const strokeWidth = 4;
    const offset = 16; // Total expansion (8px gap on each side)
    const svgWidth = dimensions.width + offset;
    const svgHeight = dimensions.height + offset;
    const pathD = generatePath(svgWidth, svgHeight, strokeWidth);

    // Approximate perimeter for dasharray
    const perimeter = dimensions.width > 0
        ? 2 * (svgWidth - svgHeight) + Math.PI * (svgHeight - strokeWidth)
        : 100;

    return (
        <main className="relative h-screen w-full overflow-hidden p-[15px] bg-white">
            <div className="relative h-full w-full overflow-hidden rounded-sm md:rounded-lg bg-[#656766] flex flex-col items-center justify-center text-center">

                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0 opacity-40"
                >
                    <source src="/video/404-bg.mp4" type="video/mp4" />
                </video>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
                    <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-black/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6 p-4">
                    <h1 className="text-[120px] md:text-[180px] font-medium font-sans text-white leading-none tracking-tighter opacity-90">
                        404
                    </h1>

                    <div className="flex items-center gap-2">
                        <GradientBolt />
                        <span className="text-xl md:text-2xl font-medium text-white/80 tracking-tight">
                            Page Not Found
                        </span>
                        <GradientBolt />
                    </div>

                    <p className="mt-2 max-w-lg text-white/60 text-sm md:text-base font-medium text-balance">
                        The page you are looking for doesn't exist or has been moved.
                    </p>

                    <div className="relative group mt-8 inline-block">

                        <Link
                            ref={buttonRef}
                            href="/"
                            className="relative px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all flex items-center gap-2 z-10"
                        >
                            <span>Return Home</span>

                        </Link>

                        {/* Progress Border SVG Overlay (Outside) */}
                        <svg
                            className={`absolute pointer-events-none overflow-visible z-20 transition-opacity duration-300 ${dimensions.width > 0 ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                top: -(offset / 2),
                                left: -(offset / 2),
                                width: svgWidth,
                                height: svgHeight
                            }}
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        >
                            <path
                                d={pathD}
                                fill="none"
                                stroke="#0158ff" // Blue color
                                strokeWidth={strokeWidth}
                                strokeLinecap="round" // Nicer end caps
                                strokeDasharray={perimeter}
                                strokeDashoffset={perimeter - (progress / 100) * perimeter}
                                className="transition-[stroke-dashoffset] duration-[50ms] ease-linear"
                            />
                        </svg>

                        <div className="absolute -bottom-10 left-0 w-full text-center">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                                Auto-redirecting in {Math.ceil(20 - (progress / 100) * 20)}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Badge Positioned same as Hero */}
                <div className="absolute top-[20px] right-[20px] z-50 flex flex-col items-end pointer-events-none opacity-50">
                    <span className="text-white/40 text-xs font-mono">ERR::404::MISSING</span>
                </div>
            </div>
        </main>
    );
}
