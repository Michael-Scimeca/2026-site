"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
    useEffect(() => {
        // Force scroll to top on load/refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        const lenis = new Lenis({
            autoRaf: true,
        });

        lenis.scrollTo(0, { immediate: true });

        // Check if scroll should be initially stopped
        if (document.body.style.overflow === 'hidden') {
            lenis.stop();
        }

        const stop = () => lenis.stop();
        const start = () => lenis.start();

        window.addEventListener('lenis-stop', stop);
        window.addEventListener('lenis-start', start);

        return () => {
            lenis.destroy();
            window.removeEventListener('lenis-stop', stop);
            window.removeEventListener('lenis-start', start);
        };
    }, []);

    return null;
}
