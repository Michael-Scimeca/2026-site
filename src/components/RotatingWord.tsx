"use client";

import React, { useState, useEffect } from "react";

interface RotatingWordProps {
    words: string[];
    interval?: number;
    className?: string;
}

export function RotatingWord({
    words,
    interval = 3000,
    className = "",
}: RotatingWordProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % words.length);
        }, interval);
        return () => clearInterval(timer);
    }, [words.length, interval]);

    return (
        <span
            className={`text-[#feaf01] inline-flex overflow-hidden align-bottom ${className}`}
            style={{ height: "1.25em" }}
        >
            <span
                key={index}
                style={{
                    display: "inline-block",
                    animation: "rwUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                }}
            >
                {words[index]}
            </span>
        </span>
    );
}
