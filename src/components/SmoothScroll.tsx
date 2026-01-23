"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true, // Use automatic standard RAF
        });

        // Force scroll to top on load
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });

        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
}
