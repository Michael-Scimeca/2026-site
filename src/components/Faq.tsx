"use client";

import React, { useState } from 'react';
import { Container } from './Container';

interface FaqItem {
    question: string;
    answer: string;
}

const faqs: FaqItem[] = [
    {
        question: "Why choose Me?",
        answer: "I bring a unique blend of creative design, technical engineering, and AI automation expertise. I don't just build websites; I create digital experiences that drive engagement and business growth."
    },
    {
        question: "What is your web design and development process?",
        answer: "My process is collaborative and iterative. It starts with discovery and strategy, moves into design and prototyping, followed by development, testing, and launch. I ensure you are involved at every step."
    },
    {
        question: "How much does a custom website cost?",
        answer: "Costs vary depending on the scope, complexity, and specific requirements of the project. I offer tailored solutions to fit different budgets and needs. Let's discuss your project to get a quote."
    },
    {
        question: "How long does a project take?",
        answer: "Timeline depends on the project size. A simple site might take 2-4 weeks, while a complex web application could take 2-3 months. I prioritize quality and realistic timelines."
    },
    {
        question: "Can you redesign our existing website?",
        answer: "Yes! I can audit your current site, identify pain points, and completely overhaul the design and performance while keeping your SEO rankings intact."
    },
    {
        question: "Do you use templates or are websites custom built?",
        answer: "I specialize in custom-built solutions tailored to your brand. While I can work with templates if requested, custom builds offer superior performance, flexibility, and uniqueness."
    },
    {
        question: "Will we be able to manage the site ourselves after launch?",
        answer: "Absolutely. I build sites with user-friendly CMS integrations (like Sanity, WordPress, or others) so you can easily update content without needing to touch code."
    },
    {
        question: "What if our site has slow load times?",
        answer: "I optimize every site for speed, using modern frameworks like Next.js and best practices for image optimization and code splitting to ensure lightning-fast load times."
    },
    {
        question: "What if our site has been hacked or is insecure?",
        answer: "Security is a top priority. I use secure hosting, SSL certificates, and best practices to protect your site. If you have an existing compromised site, I can help clean and secure it."
    },

    {
        question: "We’ve struggled with too many plugins. How do you handle this?",
        answer: "I believe in lean, efficient code. I minimize reliance on heavy plugins by building custom functionality, which improves security and performance."
    },
    {
        question: "Can you integrate third-party systems?",
        answer: "Yes, I have extensive experience integrating APIs, CRMs (like HubSpot, Salesforce), payment gateways (Stripe), and other third-party tools seamlessly."
    },

];

export function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 md:py-32 bg-black overflow-hidden border-t border-white/5">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                    {/* Header: Label - Now spans full width to align with grid start */}
                    <div className="md:col-span-12 text-left">
                        <span className="text-[#52525b] text-sm md:text-base block">
                            FAQs
                        </span>
                    </div>

                    {/* Content: FAQs - Spans full width */}
                    <div className="md:col-span-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {faqs.map((faq, i) => (
                                <FaqItem
                                    key={i}
                                    item={faq}
                                    isOpen={openIndex === i}
                                    onClick={() => toggleFaq(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}

function FaqItem({ item, isOpen, onClick }: { item: FaqItem, isOpen: boolean, onClick: () => void }) {
    return (
        <div
            className={`border-b py-6 cursor-pointer group relative overflow-hidden transition-colors duration-300 ${isOpen ? 'border-blue-500' : 'border-white/10'}`}
            onClick={onClick}
        >
            {/* Pulsing Blue Border */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-flow z-10 pointer-events-none" />

            <div className="flex justify-between items-center gap-4 relative z-20">
                <h3 className="text-lg md:text-xl font-medium text-white group-hover:text-blue-500 transition-colors duration-300">
                    {item.question}
                </h3>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-blue-500 transition-colors" />
                    </svg>
                </div>
            </div>
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden pt-4 relative z-20">
                    <p className={`text-base leading-relaxed faq-answer-wave ${isOpen ? 'is-open' : ''}`}>
                        {item.answer}
                    </p>
                </div>
            </div>
        </div>
    );
}
