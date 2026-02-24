"use client";
import React, { useEffect, useRef } from 'react';

interface GradientBackgroundProps {
    themeColor?: string;
    className?: string;
    style?: React.CSSProperties;
    disableInteractive?: boolean;
}

export function GradientBackground({ themeColor, className = "", style = {}, disableInteractive = false }: GradientBackgroundProps) {
    const interBubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disableInteractive) return;

        let curX = 0;
        let curY = 0;
        let tgX = 0;
        let tgY = 0;
        let animationFrameId: number;

        const move = () => {
            curX += (tgX - curX) / 20;
            curY += (tgY - curY) / 20;
            if (interBubbleRef.current) {
                interBubbleRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
            }
            animationFrameId = requestAnimationFrame(move);
        };

        const handleMouseMove = (event: MouseEvent) => {
            tgX = event.clientX;
            tgY = event.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);
        move();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [disableInteractive]);

    const hexToRgb = (hex: string) => {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const containerStyle = React.useMemo(() => {
        const baseStyle: React.CSSProperties = { ...style };

        if (themeColor) {
            const rgb = hexToRgb(themeColor);
            if (rgb) {
                const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                const darkRgbString = `${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)}`;
                const lightRgbString = `${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}`;

                return {
                    ...baseStyle,
                    '--gm-color1': rgbString,
                    '--gm-color2': darkRgbString,
                    '--gm-color3': lightRgbString,
                    '--gm-color4': rgbString,
                    '--gm-color5': darkRgbString,
                    '--gm-color-interactive': rgbString,
                    '--gm-color-bg2': themeColor
                } as React.CSSProperties;
            }
        }
        return baseStyle;
    }, [themeColor, style]);

    return (
        <div className={`gradient-morph-container ${className}`} style={containerStyle}>
            <svg className="gradient-morph-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="morph-goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>
            <div className="gradient-morph-gradients">
                <div className="gm-blob gm-g1"></div>
                <div className="gm-blob gm-g2"></div>
                <div className="gm-blob gm-g3"></div>
                <div className="gm-blob gm-g4"></div>
                <div className="gm-blob gm-g5"></div>
                <div className="gm-blob gm-g6"></div>
                <div className="gm-blob gm-g7"></div>
                <div className="gm-blob gm-g8"></div>
                <div className="gm-blob gm-g9"></div>
                <div className="gm-blob gm-g10"></div>
                {!disableInteractive && <div className="gm-interactive" ref={interBubbleRef}></div>}
            </div>
        </div>
    );
}
