'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

const CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
    const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored === 'accepted' || stored === 'declined') {
            setConsent(stored);
        } else {
            // Small delay so the banner doesn't flash on page load
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setConsent('accepted');
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        setConsent('declined');
        setVisible(false);
    };

    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <>
            {/* Only load GA after explicit consent */}
            {consent === 'accepted' && gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}');
                        `}
                    </Script>
                </>
            )}

            {/* Cookie Banner */}
            {visible && (
                <div
                    className="fixed bottom-4 left-4 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-500"
                >
                    <div className="w-[180px] bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2.5 shadow-2xl shadow-black/50">
                        <p className="text-zinc-400 text-[9px] leading-relaxed mb-2">
                            This site uses cookies for analytics.{' '}
                            <a
                                href="/privacy"
                                className="text-[#0158ff] hover:underline underline-offset-2"
                            >
                                Learn more
                            </a>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handleDecline}
                                className="flex-1 px-2 py-1 text-zinc-500 hover:text-white text-[9px] font-medium rounded border border-white/10 transition-colors cursor-pointer"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 px-2 py-1 bg-[#0158ff] hover:bg-[#0046cc] text-white text-[9px] font-semibold rounded transition-all cursor-pointer"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
