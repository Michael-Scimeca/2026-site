"use client";

import React, { useState } from 'react';
import { TicTacToe } from './TicTacToe';
import { Pong } from './Pong';
import { GameWinnerForm } from './GameWinnerForm';

type GameType = 'tictactoe' | 'pong';

export function GameContainer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeGame, setActiveGame] = useState<GameType>('tictactoe');
    const [showWinnerForm, setShowWinnerForm] = useState(false);

    const handleWin = () => {
        setShowWinnerForm(true);
    };

    return (
        <div className="flex flex-col items-end gap-3 group/container relative">
            {/* Winner Form - Positioned absolute top right of the container */}
            {showWinnerForm && (
                <div className="z-[100]">
                    <GameWinnerForm
                        onClose={() => setShowWinnerForm(false)}
                        game={activeGame}
                    />
                </div>
            )}

            {/* Game selector icons - always visible, fixed position */}
            <div className={`relative flex items-center transition-opacity duration-300 ${showWinnerForm ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Tic-Tac-Toe Icon */}
                <button
                    onClick={() => {
                        if (!isOpen) {
                            setActiveGame('tictactoe');
                            setIsOpen(true);
                        } else {
                            setActiveGame('tictactoe');
                        }
                    }}
                    className={`relative p-1.5 cursor-pointer pointer-events-auto group/icon transition-colors ${isOpen && activeGame === 'tictactoe'
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/60'
                        }`}
                    aria-label="Play Tic-Tac-Toe"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <line x1="8" y1="4" x2="8" y2="20" />
                        <line x1="16" y1="4" x2="16" y2="20" />
                        <line x1="4" y1="8" x2="20" y2="8" />
                        <line x1="4" y1="16" x2="20" y2="16" />
                    </svg>
                </button>

                {/* Pong Icon */}
                <button
                    onClick={() => {
                        if (!isOpen) {
                            setActiveGame('pong');
                            setIsOpen(true);
                        } else {
                            setActiveGame('pong');
                        }
                    }}
                    className={`relative p-1.5 cursor-pointer pointer-events-auto group/icon ${isOpen && activeGame === 'pong'
                        ? 'opacity-100'
                        : 'opacity-90 hover:opacity-90'
                        }`}
                    aria-label="Play Pong"
                >
                    <img
                        src="/pingpong-icon.png"
                        alt="Pong"
                        className="w-6 h-6 transition-opacity"
                    />
                </button>

                {/* Animated underline - slides between icons */}
                {isOpen && (
                    <div
                        className="absolute -bottom-1 h-[2px] bg-white rounded-full transition-all duration-300 ease-out"
                        style={{
                            left: activeGame === 'tictactoe' ? '6px' : 'calc(50% + 6px)',
                            width: '24px'
                        }}
                    />
                )}
            </div>

            {/* Game container - only shows when open and form is hidden */}
            {isOpen && (
                <div className={`flex flex-col items-center gap-3 backdrop-blur-sm bg-black/5 p-6 rounded-2xl border border-white/5 shadow-2xl pointer-events-auto animate-fade-in transition-opacity duration-300 ${showWinnerForm ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {/* Close button - inside blur container */}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setActiveGame('tictactoe'); // Reset to default
                        }}
                        className="text-[10px] text-white/30 hover:text-white transition-colors tracking-widest uppercase cursor-pointer"
                    >
                        Close Game
                    </button>

                    {/* Game component - without its own blur container */}
                    {activeGame === 'tictactoe' ? (
                        <TicTacToe isOpen={true} onToggle={() => { }} hideCloseButton={true} onWin={handleWin} />
                    ) : (
                        <Pong isOpen={true} onToggle={() => { }} hideCloseButton={true} onWin={handleWin} />
                    )}
                </div>
            )}
        </div>
    );
}
