"use client";

import React, { useState } from 'react';
import { TicTacToe } from './TicTacToe';
import { Pong } from './Pong';
import { Checkers } from './Checkers';
import { CheckersIcon } from './CheckersIcon';
import { GameWinnerForm } from './GameWinnerForm';

import { SpaceInvaders } from './SpaceInvaders';
import { SpaceInvadersIcon } from './SpaceInvadersIcon';

type GameType = 'tictactoe' | 'pong' | 'checkers' | 'spaceinvaders';

export function GameContainer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeGame, setActiveGame] = useState<GameType>('tictactoe');
    const [showWinnerForm, setShowWinnerForm] = useState(false);
    const [stats, setStats] = useState<any>({});
    const containerRef = React.useRef<HTMLDivElement>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/game-stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    React.useEffect(() => {
        fetchStats();

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // If the winner form is showing, we might not want to close everything immediately, 
                // but usually clicking outside implies dismissal.
                // However, let's stick to closing the game panel.
                setIsOpen(false);
                setActiveGame('tictactoe');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleWin = () => {
        setShowWinnerForm(true);
        fetchStats(); // Refresh stats on win
    };

    return (
        <div ref={containerRef} className="flex flex-col items-end gap-3 group/container relative">
            {/* Winner Form - Positioned absolute top right of the container */}
            {showWinnerForm && (
                <div className="z-[100]">
                    <GameWinnerForm
                        onClose={() => setShowWinnerForm(false)}
                        game={activeGame}
                    />
                </div>
            )}

            {/* Game selector icons - always visible on desktop, hidden on touch/mobile */}
            <div className={`hidden md:flex items-center transition-opacity duration-300 ${showWinnerForm ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase mr-4 select-none">
                    Playground
                </span>

                <div className="relative flex items-center">
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
                        className={`relative p-1.5 cursor-pointer pointer-events-auto group/icon transition-colors ${isOpen && activeGame === 'pong'
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                        aria-label="Play Pong"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <path d="M4 6V18H7V6H4ZM17 6V18H20V6H17ZM10.5 10.5V13.5H13.5V10.5H10.5Z" />
                        </svg>
                    </button>

                    {/* Checkers Icon */}
                    <button
                        onClick={() => {
                            if (!isOpen) {
                                setActiveGame('checkers');
                                setIsOpen(true);
                            } else {
                                setActiveGame('checkers');
                            }
                        }}
                        className={`relative p-1.5 cursor-pointer pointer-events-auto group/icon transition-colors ${isOpen && activeGame === 'checkers'
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                        aria-label="Play Checkers"
                    >
                        <CheckersIcon className="opacity-80 hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Space Invaders Icon */}
                    <button
                        onClick={() => {
                            if (!isOpen) {
                                setActiveGame('spaceinvaders');
                                setIsOpen(true);
                            } else {
                                setActiveGame('spaceinvaders');
                            }
                        }}
                        className={`relative p-1.5 cursor-pointer pointer-events-auto group/icon transition-colors ${isOpen && activeGame === 'spaceinvaders'
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                        aria-label="Play Space Invaders"
                    >
                        <SpaceInvadersIcon className="opacity-80 hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Animated underline - slides between icons */}
                    {isOpen && (
                        <div
                            className="absolute -bottom-1 h-[2px] bg-white rounded-full transition-all duration-300 ease-out"
                            style={{
                                left: activeGame === 'tictactoe' ? '6px' :
                                    activeGame === 'pong' ? 'calc(25% + 6px)' :
                                        activeGame === 'checkers' ? 'calc(50% + 6px)' :
                                            'calc(75% + 6px)',
                                width: '24px'
                            }}
                        />
                    )}
                </div>
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
                        <TicTacToe
                            isOpen={true}
                            onToggle={() => setIsOpen(false)}
                            hideCloseButton={true}
                            onWin={handleWin}
                            initialHumanWins={stats.ticTacToeHumanWins || 0}
                            initialAiWins={stats.ticTacToeAiWins || 0}
                        />
                    ) : activeGame === 'pong' ? (
                        <Pong
                            isOpen={true}
                            onToggle={() => setIsOpen(false)}
                            hideCloseButton={true}
                            onWin={handleWin}
                            initialHumanWins={stats.pongHumanWins || 0}
                            initialAiWins={stats.pongAiWins || 0}
                        />
                    ) : activeGame === 'checkers' ? (
                        <Checkers
                            isOpen={true}
                            onToggle={() => setIsOpen(false)}
                            hideCloseButton={true}
                            onWin={handleWin}
                            initialHumanWins={stats.checkersHumanWins || 0}
                            initialAiWins={stats.checkersAiWins || 0}
                        />
                    ) : (
                        <SpaceInvaders
                            isOpen={true}
                            onToggle={() => setIsOpen(false)}
                            hideCloseButton={true}
                            onWin={handleWin}
                            initialHumanWins={stats.spaceInvadersHumanWins || 0}
                            initialAiWins={stats.spaceInvadersAiWins || 0}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
