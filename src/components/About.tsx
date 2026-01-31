import React from 'react';
import { Container } from './Container';
import { PortableTextBlock } from 'sanity';

interface AboutProps {
    description?: PortableTextBlock[];
}

// Minimal portable text components or basic rendering
// For now assuming simple text or using a library later
// I'll just json stringify or use a placeholder if complex
import { PortableText } from '@portabletext/react';

export function About({ description }: AboutProps) {
    if (!description) return null;

    return (
        <section className="py-24 bg-black">
            <Container>
                <div className="max-w-4xl mx-auto text-xl md:text-3xl leading-relaxed text-white font-light tracking-wide">
                    <PortableText value={description} />
                </div>
            </Container>
        </section>
    );
}
