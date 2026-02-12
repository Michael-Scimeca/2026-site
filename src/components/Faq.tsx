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
        answer: "I don't just build websites—I create experiences. From interactive games to AI-powered tools, I blend creative design with cutting-edge tech. I've built everything from Tic-Tac-Toe AIs to complex web apps for major brands. If you want something that stands out, I'm your person."
    },
    {
        question: "Can you build interactive experiences and games?",
        answer: "Absolutely! I specialize in interactive web experiences. Check out the games on this site—Tic-Tac-Toe, Pong, Checkers, Space Invaders—all built from scratch with custom AI. I love creating engaging, playful experiences that keep users coming back."
    },
    {
        question: "Do you work with AI and automation?",
        answer: "Yes! I build AI-powered tools and automation systems using platforms like n8n for workflow automation. Whether it's a smart chatbot, predictive analytics, or automating repetitive tasks with custom workflows, I can help you leverage AI to work smarter, not harder."
    },
    {
        question: "How much does a project cost?",
        answer: "It depends on what you need. A simple landing page might start around $2-5k, while a full web app with custom features could be $10-30k+. I offer flexible pricing and can work within your budget. Let's chat about your project and I'll give you a transparent quote."
    },
    {
        question: "How long does a project take?",
        answer: "Timelines vary. A simple site takes 2-4 weeks, while a complex app might take 2-3 months. I prioritize quality over speed, but I'm also efficient. I'll give you a realistic timeline upfront—no surprises."
    },
    {
        question: "What's your design and development process?",
        answer: "I start with discovery—understanding your goals and audience. Then I design, prototype, and iterate with your feedback. Once we're aligned, I build, test, and launch. You're involved at every step, and I keep things transparent and collaborative."
    },
    {
        question: "Can you redesign our existing website?",
        answer: "Definitely! I can audit your current site, identify what's not working, and rebuild it to be faster, more beautiful, and more effective—all while preserving your SEO and brand equity."
    },
    {
        question: "Will we be able to update the site ourselves?",
        answer: "Yes! I build sites with user-friendly CMS platforms like Sanity or WordPress. You'll be able to update content, images, and pages without touching code. I'll also provide training so you feel confident managing it."
    },
    {
        question: "How do you ensure sites are fast?",
        answer: "I use modern frameworks like Next.js, optimize images, lazy-load content, and minimize code bloat. I also test performance rigorously. Fast sites rank better, convert more, and keep users happy—so speed is non-negotiable for me."
    },
    {
        question: "What if our site gets hacked or has security issues?",
        answer: "Security is built-in from day one. I use SSL certificates, secure hosting, rate limiting, and best practices to protect your site. If you have an existing compromised site, I can clean it up and lock it down."
    },
    {
        question: "Can you integrate third-party tools and APIs?",
        answer: "Absolutely. I've integrated everything from payment gateways (Stripe) to CRMs (HubSpot, Salesforce), email services (Resend, SendGrid), and custom APIs. If it has an API, I can connect it."
    },
    {
        question: "Do you offer ongoing support after launch?",
        answer: "Yes! I offer maintenance packages for updates, bug fixes, and ongoing improvements. I'm also available for one-off updates if you just need something tweaked. Your site won't be abandoned after launch."
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
