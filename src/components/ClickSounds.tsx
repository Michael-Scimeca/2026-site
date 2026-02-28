"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";

/**
 * Global click-sound handler.
 * - Generic click anywhere   → clicking.mp3
 * - Click on a button / link → activeclick.mp3
 */
export function ClickSounds() {
    const clickRef = useRef<Howl | null>(null);
    const activeRef = useRef<Howl | null>(null);

    useEffect(() => {
        // Lazy-init sounds on first use
        clickRef.current = new Howl({
            src: ["/sounds/clicking.mp3"],
            volume: 0.02,
            preload: true,
        });
        activeRef.current = new Howl({
            src: ["/sounds/activeclick.mp3"],
            volume: 0.15,
            preload: true,
        });

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Walk up to find if the click landed on an interactive element
            const interactive = target.closest(
                'button, a, [role="button"], input[type="submit"], input[type="button"], [tabindex="0"]'
            );

            if (interactive) {
                activeRef.current?.play();
            } else {
                clickRef.current?.play();
            }
        };

        document.addEventListener("click", handleClick, { capture: true });

        return () => {
            document.removeEventListener("click", handleClick, { capture: true });
        };
    }, []);

    return null; // No UI — pure side-effect component
}
