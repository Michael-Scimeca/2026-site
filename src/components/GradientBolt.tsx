import React from 'react';

export function GradientBolt() {
    return (
        <button
            className="group relative inline-flex items-center justify-center mx-[0.2em] active:scale-95 cursor-pointer"
            aria-label="Bolt"
        >
            {/* The Bolt Icon/Text with Gradient Clip */}
            <span className="
                font-bold text-[1em] leading-none 
                bg-gradient-to-r from-[#0158ff] via-[#3b82f6] to-[#0158ff] 
                bg-[length:200%_auto] animate-gradient-x
                bg-clip-text text-transparent
                filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]
            ">
                ⌁
            </span>
        </button>
    );
}
