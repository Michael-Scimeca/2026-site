"use client";

import React, { useState } from 'react';

interface GameWinnerFormProps {
    onClose: () => void;
    game?: string;
}

export function GameWinnerForm({ onClose, game = 'tictactoe' }: GameWinnerFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    winner: 'human',
                    name,
                    email,
                    game,
                    skipStatsUpdate: true
                })
            });
            if (!res.ok) throw new Error('Failed to submit');
            setIsSubmitting(false);
            onClose();
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            // Still close on error to not block the user, or show error message?
            // For now just close.
            onClose();
        }
    };

    return (
        <div className="absolute top-0 right-0 z-[100] w-[300px] md:w-[340px] animate-fade-in pointer-events-auto">
            <div className="bg-[#00C853] p-8 rounded-[2rem] shadow-2xl flex flex-col text-center relative overflow-hidden">
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent " />
                <button
                    onClick={onClose}
                    className="mb-3 text-white/60 hover:text-white relative z-10 text-[10px] uppercase tracking-widest transition-colors font-medium cursor-pointer"
                >
                    Close Form
                </button>
                <p className="relative text-white text-[15px] font-semibold leading-relaxed mb-6">
                    Nice win! When the robots rise,<br />
                    I need to know who I’ll join forces with<br />
                    — what’s your name?
                </p>

                <form onSubmit={handleSubmit} className="relative w-full flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3 rounded-full bg-white text-gray-800 placeholder:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 text-sm shadow-sm"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-3 rounded-full bg-white text-gray-800 placeholder:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 text-sm shadow-sm"
                        required
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 px-5 py-3 rounded-full bg-[#00962A] hover:bg-[#007E23] text-white font-bold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm"
                    >
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </button>
                </form>


            </div>
        </div>
    );
}
