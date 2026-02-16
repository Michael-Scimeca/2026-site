"use client";

import React, { useState, useEffect } from "react";
import { gsap } from "gsap";

export function TicTacToe({ isOpen, onToggle, hideCloseButton, onWin, initialHumanWins = 0, initialAiWins = 228 }: { isOpen?: boolean, onToggle?: () => void, hideCloseButton?: boolean, onWin?: () => void, initialHumanWins?: number, initialAiWins?: number }) {
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [losses, setLosses] = useState(initialAiWins);

    // Internal state for standalone usage if props aren't provided
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isGameOpen = isOpen !== undefined ? isOpen : internalIsOpen;
    const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

    const calculateWinner = (squares: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (const [a, b, c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const getBestMove = (squares: (string | null)[]) => {
        const emptyCells = squares.map((v, i) => v === null ? i : null).filter((v) => v !== null) as number[];
        if (emptyCells.length === 0) return null;

        // Make mistakes 66% of the time to let the player win sometimes
        if (Math.random() < 0.66) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        // 1. Try to win
        for (const i of emptyCells) {
            const copy = [...squares];
            copy[i] = "O";
            if (calculateWinner(copy) === "O") return i;
        }

        // 2. Block player X
        for (const i of emptyCells) {
            const copy = [...squares];
            copy[i] = "X";
            if (calculateWinner(copy) === "X") return i;
        }

        // 3. Take center
        if (squares[4] === null) return 4;

        // 4. Random move
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };

    const [humanWins, setHumanWins] = useState(initialHumanWins);

    const trackWin = async (winner: 'human' | 'ai') => {
        try {
            const res = await fetch('/api/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner, game: 'tictactoe' })
            });
            const data = await res.json();
            if (data.tictactoeAiWins !== undefined) setLosses(data.tictactoeAiWins);
            if (data.tictactoeHumanWins !== undefined) setHumanWins(data.tictactoeHumanWins);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClick = (i: number) => {
        if (winner || board[i] || !isXNext) return;

        const newBoard = board.slice();
        newBoard[i] = "X";
        setBoard(newBoard);
        setIsXNext(false);

        const win = calculateWinner(newBoard);
        if (win) {
            setWinner(win);
            if (win === "X") {
                setHumanWins(prev => prev + 1);
                trackWin('human');
                // Trigger win form callback
                setTimeout(() => onWin?.(), 1000);
            }
        } else if (!newBoard.includes(null)) {
            setWinner("Draw");
        }
    };

    // Fetch global stats on mount
    useEffect(() => {
        fetch('/api/game-stats')
            .then(res => res.json())
            .then(data => {
                if (data.tictactoeAiWins !== undefined) setLosses(data.tictactoeAiWins);
                if (data.tictactoeHumanWins !== undefined) setHumanWins(data.tictactoeHumanWins);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!isXNext && !winner) {
            const timer = setTimeout(() => {
                const move = getBestMove(board);
                if (move !== null) {
                    const newBoard = board.slice();
                    newBoard[move] = "O";
                    setBoard(newBoard);
                    setIsXNext(true);

                    const win = calculateWinner(newBoard);
                    if (win) {
                        setWinner(win);
                        if (win === "O") {
                            // Optimistically update local state immediately
                            setLosses(prev => prev + 1);
                            // Sync with global stats in background
                            trackWin('ai');
                        }
                    }
                    else if (!newBoard.includes(null)) setWinner("Draw");
                }
            }, 600); // 600ms delay for "thinking"
            return () => clearTimeout(timer);
        }
    }, [isXNext, board, winner]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
    };

    useEffect(() => {
        if (winner && winner !== "X") {
            const timer = setTimeout(resetGame, 2500);
            return () => clearTimeout(timer);
        }
    }, [winner]);

    // Simply reset when isOpen changes to false
    useEffect(() => {
        if (!isGameOpen) {
            resetGame();
        }
    }, [isGameOpen]);

    if (!isGameOpen) {
        return (
            <button
                onClick={() => handleToggle()}
                className="text-white/40 hover:text-white transition-colors p-1.5 cursor-pointer pointer-events-auto"
                aria-label="Play Tic-Tac-Toe"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 3v18M16 3v18M3 8h18M3 16h18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2 group/container relative">
            {!hideCloseButton && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                    className="text-[10px] text-white/30 hover:text-white transition-colors tracking-widest uppercase z-50 cursor-pointer pointer-events-auto"
                >
                    Close Game
                </button>
            )}

            <div className={hideCloseButton ? '' : 'flex flex-col items-center gap-3 backdrop-blur-sm bg-black/5 p-6 rounded-2xl border border-white/10 shadow-2xl transition-opacity duration-300'}>
                <div className="relative w-[150px] h-[150px] md:w-[180px] md:h-[180px] pointer-events-auto group tic-tac-toe-board">
                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full border-collapse">
                        {board.map((cell, i) => (
                            <div
                                key={i}
                                onClick={() => handleClick(i)}
                                className={`
                  relative flex items-center justify-center
                  border-white/20 transition-colors
                  ${isXNext ? "hover:bg-white/10" : "hover:bg-black/20"}
                  ${i < 6 ? "border-b" : ""}
                  ${i % 3 < 2 ? "border-r" : ""}
                `}
                            >
                                {cell === "X" && (
                                    <svg className="w-[60%] h-[60%]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {cell === "O" && (
                                    <svg className="w-[60%] h-[60%] text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Reset Pulse when game ends */}
                    {winner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg animate-pulse pointer-events-none">
                            <span className="text-white font-medium tracking-widest text-sm uppercase">
                                {winner === "Draw" ? "Draw" : winner === "O" ? "Nash Wins" : "Human Wins"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-1 text-[10px] md:text-xs text-white/80 tracking-[0.2em] font-medium uppercase text-center mt-[10px]">
                    <div>
                        {!winner && (
                            isXNext ? "Human" : "Nash"
                        )}
                        {winner && "Game Over"}
                    </div>
                    <div>
                        <span className="text-[9px]">Total Human Wins: {humanWins}</span><br />
                        <span className="text-[9px]">Total Nash Wins: {losses}</span>
                    </div>

                </div>
            </div>
        </div >
    );
}
