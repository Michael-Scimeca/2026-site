"use client";

import React, { useEffect, useRef, useState } from 'react';

export function Pong({ isOpen, onToggle, hideCloseButton, onWin, initialHumanWins = 0, initialAiWins = 228 }: { isOpen?: boolean, onToggle?: () => void, hideCloseButton?: boolean, onWin?: () => void, initialHumanWins?: number, initialAiWins?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [humanWins, setHumanWins] = useState(initialHumanWins);
    const [aiWins, setAiWins] = useState(initialAiWins); // Matches TicTacToe default
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const isForfeitTriggered = useRef(false);

    // Sync ref with state
    useEffect(() => {
        countdownRef.current = countdown;
        if (hasStarted && !gamePaused) {
            lastActivityRef.current = Date.now();
            isForfeitTriggered.current = false; // Reset on start
        }
    }, [countdown, hasStarted, gamePaused]);

    // Internal state for standalone usage if props aren't provided
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isGameOpen = isOpen !== undefined ? isOpen : internalIsOpen;
    const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

    // Reset score only on fresh component mount/open
    useEffect(() => {
        if (isGameOpen) {
            setScore({ player: 0, ai: 0 });
        }
    }, [isGameOpen]);

    // Handle countdown logic
    useEffect(() => {
        if (isGameOpen && hasStarted && !gamePaused) {
            setCountdown(3);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 800);
            return () => clearInterval(timer);
        } else {
            setCountdown(0);
        }
    }, [isGameOpen, hasStarted, gamePaused]);

    // Reset hasStarted/Paused when game closes
    useEffect(() => {
        if (!isGameOpen) {
            setHasStarted(false);
            setGamePaused(false);
        }
    }, [isGameOpen]);

    // ... (rest of the file until the update function) ...

    const update = () => {
        if (!hasStarted || gamePaused || countdownRef.current > 0) return;

        // Inactivity Check: 3 seconds without move = Pause
        if (Date.now() - lastActivityRef.current > 3000) {
            setGamePaused(true);
            return;
        }

        // Move Ball
        // ... (rest of update logic is unchanged) ...
    };

    // ... (rest of hooks and drawing) ...

    {
        !hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg group/start">
                <button
                    onClick={() => setHasStarted(true)}
                    className="px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-[#0158ff] hover:text-white transition-all transform active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
                >
                    Start to Play
                </button>
            </div>
        )
    }

    {
        hasStarted && gamePaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg group/start">
                <button
                    onClick={() => {
                        setGamePaused(false);
                        lastActivityRef.current = Date.now();
                    }}
                    className="px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-[#0158ff] hover:text-white transition-all transform active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
                >
                    Still Playing?
                </button>
            </div>
        )
    }

    // Game constants
    const CANVAS_SIZE = 180; // Matching TicTacToe size roughly
    const PADDLE_HEIGHT = 40;
    const PADDLE_WIDTH = 6;
    const BALL_SIZE = 4;
    const BALL_SPEED = 2; // Reduced speed since board is small
    const PADDLE_SPEED = 3;
    const WINNING_SCORE = 3; // Game over at 3 points for now to test winning quickly

    // Fetch global stats on mount
    useEffect(() => {
        fetch('/api/game-stats')
            .then(res => res.json())
            .then(data => {
                if (data.pongAiWins !== undefined) setAiWins(data.pongAiWins);
                if (data.pongHumanWins !== undefined) setHumanWins(data.pongHumanWins);
            })
            .catch(err => console.error(err));
    }, []);

    const trackWin = async (winner: 'human' | 'ai') => {
        try {
            const res = await fetch('/api/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner, game: 'pong' })
            });
            const data = await res.json();
            if (data.pongAiWins !== undefined) setAiWins(data.pongAiWins);
            if (data.pongHumanWins !== undefined) setHumanWins(data.pongHumanWins);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!isGameOpen || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game state
        let animationFrameId: number;
        let ball = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, dx: BALL_SPEED, dy: BALL_SPEED };
        let playerY = CANVAS_SIZE / 2 - PADDLE_HEIGHT / 2;
        let aiY = CANVAS_SIZE / 2 - PADDLE_HEIGHT / 2;

        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        };

        const update = () => {
            if (!hasStarted || gamePaused || countdownRef.current > 0) return;

            // Inactivity Check: 3 seconds without move = Pause
            if (Date.now() - lastActivityRef.current > 3000) {
                setGamePaused(true);
                return;
            }

            // Move Ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall collisions (top/bottom)
            if (ball.y <= 0 || ball.y + BALL_SIZE >= CANVAS_SIZE) {
                ball.dy *= -1;
            }

            // Paddle collisions
            // Player (Left)
            if (
                ball.x <= PADDLE_WIDTH + 10 && // Added padding from edge
                ball.y + BALL_SIZE >= playerY &&
                ball.y <= playerY + PADDLE_HEIGHT
            ) {
                ball.dx *= -1;
                // Add some angle variation based on where it hits the paddle
                const hitPoint = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
                ball.dy = hitPoint * BALL_SPEED * 1.5;
            }

            // AI (Right)
            if (
                ball.x + BALL_SIZE >= CANVAS_SIZE - PADDLE_WIDTH - 10 &&
                ball.y + BALL_SIZE >= aiY &&
                ball.y <= aiY + PADDLE_HEIGHT
            ) {
                ball.dx *= -1;
                const hitPoint = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
                ball.dy = hitPoint * BALL_SPEED * 1.5;
            }

            // Scoring
            if (ball.x < 0) {
                // AI point
                setScore(s => {
                    const newScore = { ...s, ai: s.ai + 1 };
                    if (newScore.ai >= WINNING_SCORE) {
                        trackWin('ai');
                    }
                    return newScore;
                });
                resetBall();
            } else if (ball.x > CANVAS_SIZE) {
                // Player point
                setScore(s => {
                    const newScore = { ...s, player: s.player + 1 };
                    if (newScore.player >= WINNING_SCORE) {
                        setHumanWins(prev => prev + 1);
                        trackWin('human');
                        onWin?.();
                    }
                    return newScore;
                });
                resetBall();
            }

            // AI Movement (Simple tracking)
            const aiCenter = aiY + PADDLE_HEIGHT / 2;
            // Introduce significant error/delay to AI so it's easily beatable (50% easier than before)
            if (Math.random() > 0.35) { // Was 0.1
                if (aiCenter < ball.y - 15) { // Increased deadzone
                    aiY += PADDLE_SPEED * 0.65; // Reduced speed (was 0.8)
                } else if (aiCenter > ball.y + 15) {
                    aiY -= PADDLE_SPEED * 0.65;
                }
            }
            // Clamp AI
            aiY = Math.max(0, Math.min(CANVAS_SIZE - PADDLE_HEIGHT, aiY));
        };

        const resetBall = () => {
            ball = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), dy: (Math.random() - 0.5) * BALL_SPEED };
        };

        const draw = () => {
            // Clear with transparency (or bg color if needed)
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            ctx.fillStyle = 'white';

            // Draw Paddles (Pill shape)
            ctx.fillStyle = 'white';
            drawRoundedRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH / 2); // Left (Player)

            ctx.fillStyle = 'white';
            drawRoundedRect(CANVAS_SIZE - 10 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH / 2); // Right (AI)

            // Draw Ball
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();

            // Draw Center Line (dotted)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(CANVAS_SIZE / 2, 0);
            ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
            ctx.stroke();

            // Draw Countdown
            if (countdownRef.current > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 40px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(countdownRef.current.toString(), CANVAS_SIZE / 2, CANVAS_SIZE / 2);
            }
        };

        const loop = () => {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        // Input handling
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            playerY = mouseY - PADDLE_HEIGHT / 2;
            // Clamp Player
            playerY = Math.max(0, Math.min(CANVAS_SIZE - PADDLE_HEIGHT, playerY));

            // Update activity ref
            lastActivityRef.current = Date.now();
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isGameOpen, hasStarted]);

    if (!isGameOpen) {
        return (
            <button
                onClick={() => handleToggle()}
                className="text-white/40 hover:text-white transition-colors p-1.5 cursor-pointer pointer-events-auto"
                aria-label="Play Pong"
            >
                {/* Pong Icon */}
                <img
                    src="/pingpong-icon.png"
                    alt="Pong"
                    className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity"
                />
            </button>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2 group/container relative">
            {!hideCloseButton && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setScore({ player: 0, ai: 0 }); // Reset score on close?
                        handleToggle();
                    }}
                    className="text-[10px] text-white/30 hover:text-white transition-colors tracking-widest uppercase z-50 cursor-pointer pointer-events-auto"
                >
                    Close Game
                </button>
            )}

            <div className={hideCloseButton ? 'opacity-100 relative' : `flex flex-col items-center gap-3 backdrop-blur-sm bg-black/5 p-6 rounded-2xl border border-white/10 shadow-2xl animate-fade-in transition-opacity duration-300 opacity-100 relative`}>
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="cursor-none bg-white/5 rounded-lg border border-white/10 shadow-inner"
                        style={{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}
                    />

                    {!hasStarted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg group/start">
                            <button
                                onClick={() => setHasStarted(true)}
                                className="px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-[#0158ff] hover:text-white transition-all transform active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
                            >
                                Start to Play
                            </button>
                        </div>
                    )}

                    {hasStarted && gamePaused && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg group/start">
                            <button
                                onClick={() => {
                                    setGamePaused(false);
                                    lastActivityRef.current = Date.now();
                                }}
                                className="px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-[#0158ff] hover:text-white transition-all transform active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
                            >
                                Still Playing?
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center gap-1 text-[10px] md:text-xs text-white/80 tracking-[0.2em] font-medium uppercase text-center mt-[10px]">
                    <div className="flex justify-between w-full px-8">
                        <span>HUMAN VS AI </span>
                    </div>
                    <div>
                        <span className="text-[9px]">TOTAL HUMAN WINS: {humanWins}</span><br />
                        <span className="text-[9px]">TOTAL AI WINS: {aiWins}</span>

                    </div>
                </div>
            </div>
        </div>
    );
}
