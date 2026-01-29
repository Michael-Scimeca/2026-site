"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function PrivacyModal() {
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("privacy_consent");
        if (!consent) {
            setIsVisible(true);
        }

        const handleOpenEvent = () => {
            setIsVisible(true);
        };

        window.addEventListener('open-privacy-modal', handleOpenEvent);
        return () => window.removeEventListener('open-privacy-modal', handleOpenEvent);
    }, []);

    useEffect(() => {
        if (isVisible && modalRef.current && overlayRef.current) {
            // Animate in
            gsap.set(overlayRef.current, { opacity: 0 });
            gsap.set(modalRef.current, { opacity: 0, y: 20, scale: 0.95 });

            const tl = gsap.timeline();
            tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
                .to(modalRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }, "-=0.2");
        }
    }, [isVisible]);

    const handleAccept = () => {
        closeModal("accepted");
    };

    const handleReject = () => {
        closeModal("rejected");
    };

    const closeModal = (choice: string) => {
        localStorage.setItem("privacy_consent", choice);

        if (modalRef.current && overlayRef.current) {
            const tl = gsap.timeline({
                onComplete: () => setIsVisible(false)
            });
            tl.to(modalRef.current, { opacity: 0, y: 10, scale: 0.95, duration: 0.2, ease: "power2.in" })
                .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
        } else {
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
            <div
                ref={modalRef}
                className="bg-white text-gray-900 rounded-lg shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={() => closeModal("dismissed")}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Privacy Preference Center</h2>

                    <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                        <p>
                            When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others have about you, including by association with your email. We (or service providers on our behalf) may then send communications and marketing to these email.
                        </p>
                        <p>
                            You may opt out of receiving this advertising by visiting <a href="https://app.retention.com/optout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://app.retention.com/optout</a>.
                        </p>
                        <p>
                            You also have the option to opt out of the collection of your personal data in compliance with GDPR. To exercise this option, please visit <a href="https://www.rb2b.com/rb2b-gdpr-opt-out" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.rb2b.com/rb2b-gdpr-opt-out</a>.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={handleAccept}
                            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm text-sm"
                        >
                            Accept All
                        </button>
                        <button
                            onClick={handleReject}
                            className="flex-1 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors text-sm"
                        >
                            Reject All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
