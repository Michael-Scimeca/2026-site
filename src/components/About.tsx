"use client";

import React from 'react';
import { Container } from './Container';
import { PortableTextBlock } from 'sanity';
import { SweetPunkText } from './SweetPunkText';

interface AboutProps {
    description?: PortableTextBlock[];
}

const STATS = [
    { value: '15+', label: 'Years experience' },
    { value: '50+', label: 'Products shipped' },
    { value: '30+', label: 'Brands worked with' },
];

export function About({ description }: AboutProps) {
    return (
        <section id="about" className="py-24 md:py-32 bg-black relative overflow-hidden" aria-labelledby="about-heading">
            <Container>
                <div className="max-w-4xl relative z-10">
                    {/* Headline */}
                    <h2 id="about-heading" className="text-[clamp(40px,6vw,72px)] font-black leading-[1.05] tracking-tight text-white mb-10">
                        Hi, I&apos;m{' '}
                        <span className="text-[#7c5cfc]">Michael.</span>
                        <br />
                        I build digital
                        <br />
                        products people love.
                    </h2>

                    {/* Body copy */}
                    <div className="space-y-6 text-[clamp(15px,1.8vw,18px)] leading-relaxed text-zinc-400 font-medium max-w-2xl">
                        <p>
                            For the past <strong className="text-white font-bold">15 years</strong>, I&apos;ve had the pleasure of working with exceptional creatives — crafting{' '}
                            <strong className="text-white font-bold">beautiful, high-performing digital products</strong> for major brands. In recent years I&apos;ve been deep in{' '}
                            <strong className="text-white font-bold">AI automation</strong>, integrating intelligent workflows that make products smarter and teams faster.
                        </p>
                        <p>
                            I care about craft. I care about performance. And I genuinely love the intersection of{' '}
                            <strong className="text-white font-bold">design, code, and AI</strong> that we&apos;re living through right now.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="mt-16 mb-10 h-px bg-white/[0.08]" />

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-6 max-w-2xl">
                        {STATS.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-[clamp(36px,5vw,56px)] font-black leading-none tracking-tight text-white">
                                    {stat.value}
                                </div>
                                <div className="text-zinc-500 text-sm mt-2 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
