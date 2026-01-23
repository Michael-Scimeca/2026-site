"use client";

import { useEffect } from "react";

const ICONS = ["🤖", "💻"];

export default function DynamicFavicon() {
    useEffect(() => {
        let index = 0;

        const updateFavicon = (emoji: string) => {
            const canvas = document.createElement("canvas");
            canvas.height = 32;
            canvas.width = 32;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.font = "28px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(emoji, 16, 18);

            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement("link");
            link.type = "image/x-icon";
            link.rel = "shortcut icon";
            link.href = canvas.toDataURL();

            if (!document.querySelector("link[rel*='icon']")) {
                document.getElementsByTagName("head")[0].appendChild(link);
            }
        };

        // Initial set
        updateFavicon(ICONS[0]);

        const interval = setInterval(() => {
            index = (index + 1) % ICONS.length;
            updateFavicon(ICONS[index]);
        }, 9000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
