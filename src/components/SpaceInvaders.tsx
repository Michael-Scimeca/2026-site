"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface SpaceInvadersProps {
    isOpen: boolean;
    onToggle: () => void;
    hideCloseButton?: boolean;
    onWin?: () => void;
    initialHumanWins?: number;
    initialAiWins?: number;
}

export function SpaceInvaders({ isOpen, onToggle, hideCloseButton = false, onWin, initialHumanWins = 0, initialAiWins = 0 }: SpaceInvadersProps) {


    // Animation Frame calculation
    const animationFrame = Math.floor(Date.now() / 500) % 2; // Toggles every 500ms


    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const [invaders, setInvaders] = useState<{ id: number; x: number; y: number }[]>([]);
    const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);

    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const [stars, setStars] = useState<{ id: number; x: number; y: number; speed: number; size: number }[]>([]);

    const runnerRef = useRef<Matter.Runner | null>(null);

    // Game state
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [humanWins, setHumanWins] = useState(initialHumanWins);
    const [invaderWins, setInvaderWins] = useState(initialAiWins);

    useEffect(() => {
        setHumanWins(initialHumanWins);
    }, [initialHumanWins]);

    useEffect(() => {
        setInvaderWins(initialAiWins);
    }, [initialAiWins]);

    // Refs for game entities to access inside closures/loops
    const gameActiveRef = useRef(true);
    const playerRef = useRef<Matter.Body | null>(null);
    const invadersRef = useRef<Matter.Body[]>([]);
    const projectilesRef = useRef<Matter.Body[]>([]);
    const lastShootTimeRef = useRef<number>(0);

    const directionRef = useRef<1 | -1>(1);
    const scoreRef = useRef<number>(0);
    const keysRef = useRef<{ [key: string]: boolean }>({});

    // Game loop requestAnimationFrame ID
    const rafRef = useRef<number>(0);

    const trackWin = async (winner: 'human' | 'ai') => {
        try {
            const res = await fetch('/api/game-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner, game: 'spaceinvaders' })
            });
            const data = await res.json();
            if (data.spaceInvadersAiWins !== undefined) setInvaderWins(data.spaceInvadersAiWins);
            if (data.spaceInvadersHumanWins !== undefined) setHumanWins(data.spaceInvadersHumanWins);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        // Cleanup
        cleanup();

        // Setup Matter.js (Headless)
        const Engine = Matter.Engine,
            Runner = Matter.Runner,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Events = Matter.Events,
            Body = Matter.Body;

        const engine = Engine.create();
        engine.gravity.y = 0;
        engineRef.current = engine;

        const width = 600;
        const height = 400;

        // Initialize Stars
        const starCount = 50;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.5 + Math.random() * 2, // Varied speed for parallax depth
            size: Math.random() < 0.8 ? 1 : 2 // Varied size
        }));
        setStars(newStars);

        // Create Player
        const player = Bodies.rectangle(width / 2, height - 30, 40, 25, {
            isStatic: true,
            label: 'player'
        });
        playerRef.current = player;
        World.add(engine.world, player);
        setPlayerPos({ x: player.position.x, y: player.position.y });

        // Create Invaders
        const rows = 4;
        const cols = 8;
        const invaderWidth = 30;
        const invaderHeight = 20;
        const startX = 50;
        const startY = 50;
        const padding = 15;

        const initialInvaders: Matter.Body[] = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const invader = Bodies.rectangle(
                    startX + c * (invaderWidth + padding),
                    startY + r * (invaderHeight + padding),
                    invaderWidth,
                    invaderHeight,
                    {
                        isStatic: true,
                        label: 'invader'
                    }
                );
                initialInvaders.push(invader);
            }
        }
        invadersRef.current = initialInvaders;
        World.add(engine.world, initialInvaders);

        // Input Handling
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === ' ' && !keysRef.current[' ']) {
                shoot();
            }
            keysRef.current[e.key] = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current[e.key] = false;
        };

        const shoot = () => {
            const now = Date.now();
            if (now - lastShootTimeRef.current < 400) return;
            lastShootTimeRef.current = now;

            const projectile = Bodies.rectangle(player.position.x, player.position.y - 20, 4, 10, {
                isSensor: true,
                label: 'projectile',
                frictionAir: 0
            });

            Body.setVelocity(projectile, { x: 0, y: -7 });

            projectilesRef.current.push(projectile);
            World.add(engine.world, projectile);
        };

        window.addEventListener('keydown', handleKeyDown);

        // Physics Update Loop
        Events.on(engine, 'beforeUpdate', () => {
            if (!gameActiveRef.current) return;

            // Player Movement (Smooth)
            const speed = 5;
            let velocityX = 0;
            if (keysRef.current['ArrowLeft']) velocityX -= speed;
            if (keysRef.current['ArrowRight']) velocityX += speed;

            // Boundary checks
            const nextX = player.position.x + velocityX;
            if (nextX > 30 && nextX < width - 30) {
                Body.setPosition(player, { x: nextX, y: player.position.y });
            }

            // Move projectiles
            projectilesRef.current.forEach(proj => {
                if (proj.position.y < 0) {
                    World.remove(engine.world, proj);
                    projectilesRef.current = projectilesRef.current.filter(p => p !== proj);
                }
            });

            // Move Invaders
            const edgePadding = 30;
            let shouldTurn = false;
            invadersRef.current.forEach(inv => {
                const x = inv.position.x;
                if (directionRef.current === 1 && x > width - edgePadding) shouldTurn = true;
                if (directionRef.current === -1 && x < edgePadding) shouldTurn = true;
            });

            if (shouldTurn) {
                directionRef.current *= -1;
                invadersRef.current.forEach(inv => {
                    Body.setPosition(inv, { x: inv.position.x, y: inv.position.y + 20 });
                });
            } else {
                invadersRef.current.forEach(inv => {
                    Body.setPosition(inv, { x: inv.position.x + (2 * directionRef.current), y: inv.position.y });
                });
            }

            // Check Win
            if (invadersRef.current.length === 0 && gameActiveRef.current) {
                gameActiveRef.current = false;
                setGameWon(true);
                setHumanWins(prev => prev + 1);
                trackWin('human');
                if (onWin) onWin();
            }

            // Check Loss
            invadersRef.current.forEach(inv => {
                if (inv.position.y > height - 50 && gameActiveRef.current) {
                    if (inv.position.y > height - 50 && gameActiveRef.current) {
                        gameActiveRef.current = false;

                        // If score is high enough, count as win even if dead
                        if (scoreRef.current >= 1500) {
                            setGameWon(true);
                            setHumanWins(prev => prev + 1);
                            trackWin('human');
                            if (onWin) onWin();
                        } else {
                            setGameOver(true);
                            setInvaderWins(prev => prev + 1);
                            trackWin('ai');
                        }
                    }
                }
            });
        });

        // Collision Detection
        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            pairs.forEach(pair => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                if ((bodyA.label === 'projectile' && bodyB.label === 'invader') ||
                    (bodyB.label === 'projectile' && bodyA.label === 'invader')) {
                    const invader = bodyA.label === 'invader' ? bodyA : bodyB;
                    const projectile = bodyA.label === 'projectile' ? bodyA : bodyB;

                    World.remove(engine.world, invader);
                    World.remove(engine.world, projectile);

                    invadersRef.current = invadersRef.current.filter(i => i !== invader);
                    projectilesRef.current = projectilesRef.current.filter(p => p !== projectile);

                    scoreRef.current += 100;
                    setScore(scoreRef.current);
                }
            });
        });

        // Run Physics Engine
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // Start React Render Loop
        const loop = () => {
            if (!gameActiveRef.current) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            };

            // Sync physics state to React state
            setPlayerPos({
                x: playerRef.current?.position.x || 0,
                y: playerRef.current?.position.y || 0
            });

            setInvaders(invadersRef.current.map(b => ({ id: b.id, x: b.position.x, y: b.position.y })));
            setProjectiles(projectilesRef.current.map(b => ({ id: b.id, x: b.position.x, y: b.position.y })));

            // Update Stars
            setStars(prevStars => prevStars.map(star => {
                let newY = star.y + star.speed;
                if (newY > 400) newY = 0; // Wrap around
                return { ...star, y: newY };
            }));

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(rafRef.current);
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const cleanup = () => {
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
        if (engineRef.current) {
            Matter.World.clear(engineRef.current.world, false);
            Matter.Engine.clear(engineRef.current);
        }
        invadersRef.current = [];
        projectilesRef.current = [];
        projectilesRef.current = [];
        scoreRef.current = 0;
        setScore(0);
        setGameOver(false);
        setGameWon(false);
        gameActiveRef.current = true;
    };

    return (
        <div className={hideCloseButton ? 'flex flex-col items-center' : 'flex flex-col items-center gap-3 backdrop-blur-sm bg-black/5 p-6 rounded-2xl border border-white/10 shadow-2xl transition-opacity duration-300'}>
            <div className="flex justify-between w-full px-4 mb-2 text-white font-mono text-xs">
                <span>Score: {score}</span>
                <span>{gameOver ? "GAME OVER" : gameWon ? "YOU WIN" : "ARROWS TO MOVE + SPACE TO SHOOT"}</span>
            </div>

            <div className="rounded border border-white/10 bg-black/50 overflow-hidden relative" style={{ width: 600, height: 400 }}>
                {/* React Render Layer */}

                {/* Stars Background */}
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="absolute bg-white/70 rounded-full"
                        style={{
                            width: star.size,
                            height: star.size,
                            left: star.x,
                            top: star.y
                        }}
                    />
                ))}

                {/* Projectiles */}
                {projectiles.map(p => (
                    <div
                        key={p.id}
                        className="absolute bg-white"
                        style={{
                            width: 4,
                            height: 10,
                            left: p.x - 2, // Center
                            top: p.y - 5
                        }}
                    />
                ))}

                {/* Player Ship */}
                <div
                    className="absolute"
                    style={{
                        width: 40,
                        height: 25,
                        left: playerPos.x - 20,
                        top: playerPos.y - 12.5
                    }}
                >
                    <svg width="40" height="25" viewBox="0 0 17 10" fill="none" shapeRendering="crispEdges">
                        <path d="M8 0h1v1H8zM7 1h3v1H7zM7 2h1v4H7zM9 2h1v4H9zM3 4h1v5H3zM13 4h1v5h-1zM4 4h3v3H4zM10 4h3v3H10zM3 7h2v1H3zM12 7h2v1h-2z" fill="#0158ff" />
                        <path d="M1 5h2v4H1zM0 6h1v3H0zM14 5h2v4h-2zM16 6h1v3h-1z" fill="#0158ff" />
                        <rect x="8" y="4" width="1" height="2" fill="#0046cc" />
                        <path d="M4 8h9v1H4zM3 9h11v1H3z" fill="#0046cc" opacity="0.8" />
                    </svg>
                </div>

                {/* Invaders */}
                {invaders.map(inv => (
                    <div
                        key={inv.id}
                        className="absolute"
                        style={{
                            width: 30,
                            height: 20,
                            left: inv.x - 15,
                            top: inv.y - 10
                        }}
                    >
                        <svg width="30" height="20" viewBox="0 0 11 8" fill="none" shapeRendering="crispEdges">
                            {animationFrame === 0 ? (
                                // Frame 1: Arms Down
                                <path d="M2 0h8v1h-8zm-1 1h1v1h-1zm10 0h1v1h-1zm-9 1h7v1h-7zm0 1h1v1h-1zm2 0h3v1h-3zm4 0h1v1h-1zm-8 1h11v1h-11zm0 1h1v1h-1zm2 0h1v1h-1zm6 0h1v1h-1zm2 0h1v1h-1zm-8 1h2v1h-2zm6 0h2v1h-2z" fill="#ef4444" />
                            ) : (
                                // Frame 2: Arms Up
                                <path d="M2 0h8v1h-8zm-1 1h1v1h-1zm10 0h1v1h-1zm-9 1h7v1h-7zm0 1h1v1h-1zm2 0h3v1h-3zm4 0h1v1h-1zm-8 1h11v1h-11zm1 1h1v1h-1zm2 0h1v1h-1zm4 0h1v1h-1zm2 0h1v1h-1zm-8 1h2v1h-2zm6 0h2v1h-2z" fill="#ef4444" />
                            )}
                            {/* Eyes */}
                            <rect x="3" y="3" width="1" height="1" fill="black" />
                            <rect x="7" y="3" width="1" height="1" fill="black" />
                        </svg>
                    </div>
                ))}

                {(gameOver || gameWon) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 flex-col gap-4">
                        <h2 className="text-2xl font-bold text-white">{gameWon ? "VICTORY!" : "GAME OVER"}</h2>
                        <button
                            onClick={() => {
                                // Reset game properly
                                cleanup();
                                // Toggle off and on to force re-init or just recheck
                                onToggle();
                            }}
                            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-1 text-[10px] md:text-xs text-white/80 tracking-[0.2em] font-medium uppercase text-center mt-[10px]">
                <div>
                    {!gameOver && !gameWon && "DEFEND"}
                    {gameWon && "VICTORY"}
                    {gameOver && "DEFEAT"}
                </div>
                <div>
                    <span className="text-[9px]">TOTAL HUMAN WINS: {humanWins}</span><br />
                    <span className="text-[9px]">TOTAL AI WINS: {invaderWins}</span>
                </div>
            </div>

            {!hideCloseButton && (
                <button
                    onClick={onToggle}
                    className="mt-2 text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                    Close Game
                </button>
            )}
        </div>
    );
}
