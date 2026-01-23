import React from 'react';
import { Container } from './Container';

interface FooterProps {
    email?: string;
    location?: string;
    socialHandle?: string;
}

export function Footer({ email, location, socialHandle }: FooterProps) {
    return (
        <footer className="bg-zinc-950 text-white py-24 mt-auto border-t border-zinc-900">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="flex flex-col gap-4">
                        {email && (
                            <a href={`mailto:${email}`} className="text-2xl md:text-3xl font-light hover:text-blue-400 transition-colors tracking-tight">
                                {email}
                            </a>
                        )}
                        {location && (
                            <p className="text-zinc-500 uppercase tracking-widest text-sm">{location}</p>
                        )}
                    </div>

                    {socialHandle && (
                        <div className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-800 select-none">
                            {socialHandle}
                        </div>
                    )}
                </div>
            </Container>
        </footer>
    );
}
