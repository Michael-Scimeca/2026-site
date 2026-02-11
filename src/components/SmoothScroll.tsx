"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
    useEffect(() => {
        // 1. Force native browser scroll restoration to manual
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // 2. Immediate native scroll reset
        window.scrollTo(0, 0);

        // 3. Initialize Lenis
        const lenis = new Lenis({
            autoRaf: true,
        });

        // 4. Force Lenis to top immediately
        lenis.scrollTo(0, { immediate: true });

        // 5. Backup: Force scroll to top again after a short delay to override any browser persistence
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
            lenis.scrollTo(0, { immediate: true });
        }, 100);

        // Check if scroll should be initially stopped
        if (document.body.style.overflow === 'hidden') {
            lenis.stop();
        }

        const stop = () => lenis.stop();
        const start = () => lenis.start();

        window.addEventListener('lenis-stop', stop);
        window.addEventListener('lenis-start', start);

        return () => {
            clearTimeout(timeoutId);
            lenis.destroy();
            window.removeEventListener('lenis-stop', stop);
            window.removeEventListener('lenis-start', start);
        };
    }, []);

    return null;
}
