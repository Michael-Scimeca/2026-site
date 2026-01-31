"use client";

import React, { useState, useEffect } from "react";

type Piece = {
    player: 'red' | 'black';
    isKing: boolean;
};

type Board = (Piece | null)[][];

export function Checkers({ isOpen, onToggle, hideCloseButton, onWin, initialHumanWins = 0, initialAiWins = 0 }: { isOpen?: boolean, onToggle?: () => void, hideCloseButton?: boolean, onWin?: () => void, initialHumanWins?: number, initialAiWins?: number }) {
    // Initial Board Setup: 8x8
    const [board, setBoard] = useState<Board>(Array(8).fill(null).map(() => Array(8).fill(null)));
    const [turn, setTurn] = useState<'red' | 'black'>('red');
    const [selectedSquare, setSelectedSquare] = useState<{ r: number, c: number } | null>(null);
    const [winner, setWinner] = useState<'red' | 'black' | 'draw' | null>(null);

    // Stats
    const [aiWins, setAiWins] = useState(initialAiWins);
    const [humanWins, setHumanWins] = useState(initialHumanWins);

    useEffect(() => {
        setAiWins(initialAiWins);
    }, [initialAiWins]);

    useEffect(() => {
        setHumanWins(initialHumanWins);
    }, [initialHumanWins]);

    // Initial Setup
    useEffect(() => {
        initializeBoard();
    }, []);

    const initializeBoard = () => {
        const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) {
                    if (r < 3) newBoard[r][c] = { player: 'black', isKing: false }; // AI
                    if (r > 4) newBoard[r][c] = { player: 'red', isKing: false };   // Human
                }
            }
        }
        setBoard(newBoard);
        setTurn('red');
        setWinner(null);
    };

    // Internal state for standalone usage
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isGameOpen = isOpen !== undefined ? isOpen : internalIsOpen;
    const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

    useEffect(() => {
        if (!isGameOpen) initializeBoard();
    }, [isGameOpen]);

    // Simple AI (Random Move)
    useEffect(() => {
        if (turn === 'black' && !winner && isGameOpen) {
            const timer = setTimeout(() => {
                makeAiMove();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, isGameOpen, board]);

    const makeAiMove = () => {
        // Collect all valid moves
        const moves: { from: { r: number, c: number }, to: { r: number, c: number }, isJump: boolean }[] = [];

        if (selectedSquare && board[selectedSquare.r][selectedSquare.c]?.player === 'black') {
            // Forced multi-jump sequence
            console.log("AI forcing multi-jump sequence from", selectedSquare);
            const pieceMoves = getValidMoves(selectedSquare, board);
            pieceMoves.forEach(m => moves.push({ from: selectedSquare, to: m.to, isJump: m.isJump }));
        } else {
            // Normal turn search
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (board[r][c]?.player === 'black') {
                        const pieceMoves = getValidMoves({ r, c }, board);
                        pieceMoves.forEach(m => moves.push({ from: { r, c }, to: m.to, isJump: m.isJump }));
                    }
                }
            }
        }

        if (moves.length === 0) {
            console.log("AI has no moves. Red wins.");
            setWinner('red');
            trackWin('human');
            onWin?.();
            return;
        }

        // Prefer jumps
        const jumps = moves.filter(m => m.isJump);
        const move = jumps.length > 0
            ? jumps[Math.floor(Math.random() * jumps.length)]
            : moves[Math.floor(Math.random() * moves.length)];

        console.log("AI deciding move:", move);
        movePiece(move.from, move.to);
    };

    const movePiece = (from: { r: number, c: number }, to: { r: number, c: number }) => {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[from.r][from.c]!;
        const isJump = Math.abs(from.r - to.r) === 2;

        // Move the piece
        newBoard[to.r][to.c] = piece;
        newBoard[from.r][from.c] = null;

        // Handle Jump Capture
        if (isJump) {
            const midR = (from.r + to.r) / 2;
            const midC = (from.c + to.c) / 2;
            newBoard[midR][midC] = null;
        }

        // King promotion
        let promoted = false;
        if (!piece.isKing) {
            if (piece.player === 'red' && to.r === 0) { piece.isKing = true; promoted = true; }
            if (piece.player === 'black' && to.r === 7) { piece.isKing = true; promoted = true; }
        }

        setBoard(newBoard);

        // Multi-jump Logic:
        // If it was a jump and NOT a promotion (promotion ends turn immediately), check for more jumps from the new position
        if (isJump && !promoted) {
            const furtherMoves = getValidMoves({ r: to.r, c: to.c }, newBoard);
            const furtherJumps = furtherMoves.filter(m => m.isJump);

            console.log('AI Move Debug:', { isJump, furtherJumpsCount: furtherJumps.length, from, to });

            if (furtherJumps.length > 0) {
                // Must continue jumping with the same piece
                console.log("Multi-jump available. Keeping turn.");
                setSelectedSquare({ r: to.r, c: to.c });
                // We DON'T change the turn here
                return;
            }
        }

        // End turn normally
        setTurn(prev => {
            console.log("Ending turn. Switching from", prev);
            return prev === 'red' ? 'black' : 'red';
        });
        setSelectedSquare(null);

        // Check Winner
        checkWinner(newBoard);
    };

    const checkWinner = (currentBoard: Board) => {
        let redCount = 0;
        let blackCount = 0;
        currentBoard.forEach(row => row.forEach(p => {
            if (p?.player === 'red') redCount++;
            if (p?.player === 'black') blackCount++;
        }));

        if (blackCount === 0) {
            setWinner('red');
            trackWin('human');
            onWin?.();
        } else if (redCount === 0) {
            setWinner('black');
            trackWin('ai');
        }
    };

    const trackWin = async (winner: 'human' | 'ai') => {
        try {
            const res = await fetch('/api/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner, game: 'checkers' })
            });
            const data = await res.json();
            if (data.checkersAiWins !== undefined) setAiWins(data.checkersAiWins);
            if (data.checkersHumanWins !== undefined) setHumanWins(data.checkersHumanWins);
        } catch (error) {
            console.error(error);
        }
    };

    const getValidMoves = (pos: { r: number, c: number }, currentBoard: Board) => {
        const piece = currentBoard[pos.r][pos.c];
        if (!piece) return [];

        const moves: { to: { r: number, c: number }, isJump: boolean }[] = [];
        const directions = [];

        if (piece.player === 'red' || piece.isKing) directions.push(-1);
        if (piece.player === 'black' || piece.isKing) directions.push(1);

        directions.forEach(dRow => {
            [-1, 1].forEach(dCol => {
                const newR = pos.r + dRow;
                const newC = pos.c + dCol;

                if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
                    if (!currentBoard[newR][newC]) {
                        moves.push({ to: { r: newR, c: newC }, isJump: false });
                    } else if (currentBoard[newR][newC]?.player !== piece.player) {
                        // Check jump
                        const jumpR = newR + dRow;
                        const jumpC = newC + dCol;
                        if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && !currentBoard[jumpR][jumpC]) {
                            moves.push({ to: { r: jumpR, c: jumpC }, isJump: true });
                        }
                    }
                }
            });
        });

        return moves;
    };

    const handleSquareClick = (r: number, c: number) => {
        if (turn !== 'red' || winner) return;

        // Select piece
        if (board[r][c]?.player === 'red') {
            setSelectedSquare({ r, c });
            return;
        }

        // Move to empty square
        if (selectedSquare && !board[r][c]) {
            const validMoves = getValidMoves(selectedSquare, board);
            const move = validMoves.find(m => m.to.r === r && m.to.c === c);
            if (move) {
                movePiece(selectedSquare, { r, c });
            }
        }
    };

    if (!isGameOpen) return null;

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

            <div className={hideCloseButton ? '' : 'flex flex-col items-center gap-3 backdrop-blur-sm bg-black/5 p-6 rounded-2xl border border-white/5 shadow-2xl transition-opacity duration-300'}>
                <div className="relative w-[280px] h-[280px] bg-[#333333] border-4 border-[#333333] rounded-sm board-shadow">
                    <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                        {board.map((row, r) =>
                            row.map((cell, c) => {
                                const isBlackSquare = (r + c) % 2 === 1;
                                const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
                                const validMoves = selectedSquare ? getValidMoves(selectedSquare, board) : [];
                                const isValidMove = validMoves.some(m => m.to.r === r && m.to.c === c);

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleSquareClick(r, c)}
                                        className={`
                                            relative flex items-center justify-center
                                            ${isBlackSquare ? 'bg-[#4a4a4a]' : 'bg-[#e5e5e5]'}
                                            ${isSelected ? 'ring-2 ring-yellow-400 inset-0 z-10' : ''}
                                            ${isValidMove ? 'cursor-pointer' : ''}
                                        `}
                                    >
                                        {isValidMove && (
                                            <div className="absolute w-3 h-3 bg-green-500/50 rounded-full animate-pulse" />
                                        )}
                                        {cell && (
                                            <div
                                                className={`
                                                    w-[80%] h-[80%] rounded-full shadow-md
                                                    ${cell.player === 'red' ? 'bg-[#0158ff] border-2 border-[#0046cc]' : 'bg-gray-900 border-2 border-black'}
                                                    ${cell.isKing ? 'ring-2 ring-yellow-400 after:content-["K"] after:text-white after:font-bold after:text-[10px] after:flex after:items-center after:justify-center' : ''}
                                                `}
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {winner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                            <span className="text-white font-bold text-xl uppercase tracking-widest">
                                {winner === 'red' ? 'Human Wins!' : 'AI Wins!'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-1 text-[10px] md:text-xs text-white/80 tracking-[0.2em] font-medium uppercase text-center mt-[10px]">
                    <div>
                        {!winner && (
                            turn === 'red' ? "YOUR TURN" : "AI THINKING..."
                        )}
                    </div>
                    <div>
                        <span className="text-[9px]">HUMAN WINS: {humanWins}</span><br />
                        <span className="text-[9px]">AI WINS: {aiWins}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
