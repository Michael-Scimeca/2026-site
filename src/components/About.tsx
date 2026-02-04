"use client";

import React from 'react';
import { Container } from './Container';
import { PortableTextBlock } from 'sanity';
import { PortableText } from '@portabletext/react';

interface AboutProps {
    description?: PortableTextBlock[];
}

export function About({ description }: AboutProps) {
    const colorizePunctuation = (text: string) => {
        return text.split(/([.,])/).map((part, i) =>
            (part === '.' || part === ',')
                ? <span key={i} className="text-[#0158ff]">{part}</span>
                : part
        );
    };

    const ptComponents = {
        block: {
            normal: ({ children }: any) => (
                <p className="mb-4 last:mb-0">
                    {React.Children.map(children, child =>
                        typeof child === 'string' ? colorizePunctuation(child) : child
                    )}
                </p>
            ),
        }
    };

    if (!description) return null;

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <Container>
                <div className="flex flex-col relative z-10">
                    {/* Header: Label */}
                    <div className="flex flex-col gap-2 relative select-none max-w-screen-md">
                        <span className="text-zinc-500 font-bold tracking-wider text-xs uppercase mb-8">About</span>
                    </div>

                    {/* Content: Text */}
                    <div className="max-w-4xl pt-4">
                        <div className="text-xl md:text-3xl leading-relaxed text-white font-light tracking-wide flex items-start gap-3">
                            <div className="space-y-6">
                                <PortableText value={description} components={ptComponents} />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
