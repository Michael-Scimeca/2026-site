"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Container } from './Container';

interface FaqItem {
    question: string;
    answer: string;
}

const faqs: FaqItem[] = [
    {
        question: "What makes you different from other developers?",
        answer: "I build interactive experiences—not just websites. From AI-powered games to automation systems, I blend design, code, and creativity to make things that stand out."
    },
    {
        question: "Can you build interactive experiences and games?",
        answer: "Yes! Check out the games on this site (Tic-Tac-Toe, Pong, Checkers, Space Invaders). All built from scratch with custom AI."
    },
    {
        question: "Do you work with AI and automation?",
        answer: "Absolutely. I build chatbots, workflow automation (n8n), predictive tools, and systems that save teams hours every week."
    },
    {
        question: "How much does a project cost?",
        answer: "Simple landing page: $2-5k. Full web app: $10-30k+. I work within your budget and give transparent quotes upfront."
    },
    {
        question: "How long does a project take?",
        answer: "Simple site: 2-4 weeks. Complex app: 2-3 months. I'll give you a realistic timeline—no surprises."
    },
    {
        question: "What's your design and development process?",
        answer: "Discovery → Design → Build → Test → Launch. You're involved at every step, and I keep things transparent."
    },
    {
        question: "Can you redesign our existing website?",
        answer: "Yes. I'll audit your site, identify what's broken, and rebuild it to be faster and more effective—while preserving your SEO."
    },
    {
        question: "Will we be able to update the site ourselves?",
        answer: "Yes! I use CMS platforms like Sanity or WordPress. You can update content without touching code. I'll train you on it too."
    },
    {
        question: "How do you ensure sites are fast?",
        answer: "Modern frameworks (Next.js), optimized images, lazy loading, and minimal code bloat. Fast sites rank better and convert more."
    },
    {
        question: "What if our site gets hacked or has security issues?",
        answer: "Security is built-in: SSL, secure hosting, rate limiting, and best practices. If you have a compromised site, I can clean and lock it down."
    },
    {
        question: "Can you integrate third-party tools and APIs?",
        answer: "Yes. Stripe, HubSpot, Salesforce, Resend, SendGrid, custom APIs—if it has an API, I can connect it."
    },
    {
        question: "Do you offer ongoing support after launch?",
        answer: "Yes! I offer maintenance packages for updates and bug fixes. Also available for one-off tweaks as needed."
    },
    {
        question: "What do you need from me to start?",
        answer: "Just your goals, brand assets (logo, colors, content), and any examples of sites you like. I'll handle the rest and guide you through each step."
    },
    {
        question: "How do handoffs and maintenance work?",
        answer: "You get full access to your site, documentation, and training. For maintenance, I offer monthly packages or pay-as-you-go support—your choice."
    },
    {
        question: "Do you collaborate with agencies and teams?",
        answer: "Absolutely! I've worked at agencies like RSQ and We Can't Stop Thinking. I integrate seamlessly as an extension of your team."
    },
];

export function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenIndex(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Filter FAQs based on search query
    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section ref={containerRef} className="bg-black overflow-hidden relative pt-10 pb-20 md:py-16">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                    {/* Header: Label */}
                    <div className="md:col-span-12 text-left">
                        <span className="text-[#52525b] text-sm md:text-base block mb-6">
                            FAQs
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="md:col-span-12">
                        <div className="relative max-w-2xl mb-8 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0158ff]/20 via-[#0158ff]/10 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search FAQs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0158ff] focus:bg-white/10 transition-all duration-300"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" className="text-zinc-500" />
                                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        {searchQuery && (
                            <p className="text-sm text-zinc-500 mb-4">
                                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
                            </p>
                        )}
                    </div>

                    {/* Content: FAQs */}
                    <div className="md:col-span-12">
                        {filteredFaqs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {filteredFaqs.map((faq, i) => {
                                    const originalIndex = faqs.indexOf(faq);
                                    return (
                                        <FaqItem
                                            key={originalIndex}
                                            item={faq}
                                            isOpen={openIndex === originalIndex}
                                            onClick={() => toggleFaq(originalIndex)}
                                            searchQuery={searchQuery}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-zinc-500 text-lg">No FAQs match your search.</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 px-6 py-2 bg-[#0158ff] hover:bg-[#0158ff]/80 text-white rounded-lg transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}

function FaqItem({ item, isOpen, onClick, searchQuery = "" }: { item: FaqItem, isOpen: boolean, onClick: () => void, searchQuery?: string }) {
    // Function to highlight matching text
    const highlightText = (text: string) => {
        if (!searchQuery) return text;

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase()
                ? <mark key={index} className="bg-[#0158ff]/30 text-white rounded px-1">{part}</mark>
                : part
        );
    };

    return (
        <div
            className={`border-b py-6 cursor-pointer group relative overflow-hidden transition-colors duration-300 ${isOpen ? 'border-[#0158ff]' : 'border-white/10'}`}
            onClick={onClick}
        >
            {/* Pulsing Blue Border */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0158ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-flow z-10 pointer-events-none" />

            <div className="flex justify-between items-center gap-4 relative z-20">
                <h3 className="text-lg md:text-xl font-medium text-white group-hover:text-[#0158ff] transition-colors duration-300">
                    {highlightText(item.question)}
                </h3>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-[#0158ff] transition-colors" />
                    </svg>
                </div>
            </div>
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden pt-4 relative z-20">
                    <p className={`text-base leading-relaxed faq-answer-wave ${isOpen ? 'is-open' : ''}`}>
                        {highlightText(item.answer)}
                    </p>
                </div>
            </div>
        </div>
    );
}
