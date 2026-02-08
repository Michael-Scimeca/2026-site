"use client";

import React from 'react';
import { Container } from './Container';
import { PortableTextBlock } from 'sanity';
import { PortableText } from '@portabletext/react';
import { NeonCursorBackground } from './NeonCursorBackground';
import { SweetPunkText } from './SweetPunkText';

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
                <div className="mb-8 last:mb-0 text-left">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return <SweetPunkText text={child} startColor="#0158ff" colorDuration={0.5} />;
                        }
                        // Handle other types (like spans for marks) if any, though usually strings dominate
                        return child;
                    })}
                </div>
            ),
        }
    };

    if (!description) return null;

    return (
        <section className="py-24 md:py-32 bg-black relative overflow-hidden">
            {/* <NeonCursorBackground /> */}
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10 ">
                    {/* Header: Label */}
                    <div className="md:col-span-2 text-left">
                        <span className="text-[#52525b] text-sm md:text-base block">
                            About Me
                        </span>
                    </div>

                    {/* Content: Text */}
                    <div className="md:col-span-9 text-left">
                        <div className="text-[clamp(24px,4vw,44px)] leading-[1.2] text-white font-normal tracking-tight -ml-[1px]">
                            <PortableText value={description} components={ptComponents} />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
