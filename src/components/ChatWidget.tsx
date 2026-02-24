"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";
import { QUICK_REPLIES } from "@/lib/knowledge-base";
import { GradientBackground } from "./GradientBackground";

/* ─── Reusable sub-components ─── */

const SpeakerButton = ({ isSpeaking, onToggle }: { isSpeaking: boolean; onToggle: () => void }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="absolute bottom-1.5 right-2 flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/10 transition-all duration-200"
        aria-label={isSpeaking ? "Stop speaking" : "Listen to this message"}
        title={isSpeaking ? "Stop" : "Listen"}
    >
        {isSpeaking ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
        ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/40 hover:text-white/70">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
        )}
    </button>
);

const FlowProgressDots = ({ steps, currentStep, color }: { steps: string[]; currentStep: string; color: "emerald" | "blue" }) => {
    const currentIdx = steps.indexOf(currentStep);
    const colorClasses = color === "emerald"
        ? { active: "bg-emerald-400", line: "bg-emerald-400/50" }
        : { active: "bg-blue-400", line: "bg-blue-400/50" };
    return (
        <div className="flex items-center gap-1.5 flex-1">
            {steps.map((step, i) => (
                <React.Fragment key={step}>
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIdx >= i ? `${colorClasses.active} scale-100` : "bg-white/15 scale-75"}`} />
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-[1px] transition-all duration-300 ${currentIdx > i ? colorClasses.line : "bg-white/10"}`} />
                    )}
                </React.Fragment>
            ))}
            <span className="ml-2 text-[10px] text-white/30">{Math.max(1, currentIdx + 1)}/{steps.length}</span>
        </div>
    );
};

const CHAT_BLOBS: { size: number; opacity: number; color: string; anim: string; top?: string; left?: string; bottom?: string; right?: string }[] = [
    { size: 200, opacity: 0.50, color: "rgba(1, 80, 254, 0.7)", top: "10%", left: "20%", anim: "chatBlobDrift1 28s" },
    { size: 180, opacity: 0.45, color: "rgba(100, 50, 255, 0.6)", bottom: "20%", right: "10%", anim: "chatBlobDrift2 32s" },
    { size: 150, opacity: 0.45, color: "rgba(0, 200, 255, 0.55)", top: "50%", left: "40%", anim: "chatBlobDrift3 36s" },
    { size: 220, opacity: 0.40, color: "rgba(1, 50, 200, 0.6)", bottom: "40%", left: "-5%", anim: "chatBlobDrift4 30s" },
    { size: 160, opacity: 0.45, color: "rgba(80, 0, 255, 0.55)", top: "60%", left: "15%", anim: "chatBlobDrift5 34s" },
];


interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

type ContactStep = "idle" | "returning" | "name" | "email" | "budget" | "timeline" | "startDate" | "confirm" | "sent";
type ScheduleStep = "idle" | "returning" | "name" | "email" | "budget" | "date" | "dateCustom" | "time" | "confirm" | "sent";
type SmsStep = "idle" | "name" | "phone" | "message" | "confirm" | "sent";

interface SmsData {
    name: string;
    phone: string;
    message: string;
}

const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM',
];

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function parseNaturalDate(input: string): string {
    const lower = input.toLowerCase().trim();
    const today = new Date();
    const result = new Date(today);

    // "tomorrow"
    if (lower === 'tomorrow') {
        result.setDate(today.getDate() + 1);
        return result.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // "X days from now" / "in X days"
    const daysMatch = lower.match(/(\d+)\s*days?\s*(from\s*now|out|away)?/) || lower.match(/in\s*(\d+)\s*days?/);
    if (daysMatch) {
        result.setDate(today.getDate() + parseInt(daysMatch[1]));
        return result.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // "X weeks from now" / "in X weeks"
    const weeksMatch = lower.match(/(\d+)\s*weeks?\s*(from\s*now|out|away)?/) || lower.match(/in\s*(\d+)\s*weeks?/);
    if (weeksMatch) {
        result.setDate(today.getDate() + parseInt(weeksMatch[1]) * 7);
        return result.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // "next Monday", "next Thursday", etc.
    const nextDayMatch = lower.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
    if (nextDayMatch) {
        const targetDay = DAYS_OF_WEEK.indexOf(nextDayMatch[1]);
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        result.setDate(today.getDate() + daysUntil);
        return result.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // "this Monday", "this Friday", etc.
    const thisDayMatch = lower.match(/this\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
    if (thisDayMatch) {
        const targetDay = DAYS_OF_WEEK.indexOf(thisDayMatch[1]);
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        result.setDate(today.getDate() + daysUntil);
        return result.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Return original if no pattern matches (e.g., already a formatted date like "Mon, Feb 16")
    return input;
}

interface ContactData {
    name: string;
    email: string;
    budget: string;
    timeline: string;
    startDate: string;
}

interface ScheduleData {
    name: string;
    email: string;
    budget: string;
    date: string;
    time: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [openCount, setOpenCount] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [contactStep, setContactStep] = useState<ContactStep>("idle");
    const [scheduleStep, setScheduleStep] = useState<ScheduleStep>("idle");
    const [contactData, setContactData] = useState<ContactData>({
        name: "",
        email: "",
        budget: "",
        timeline: "",
        startDate: "",
    });
    const [scheduleData, setScheduleData] = useState<ScheduleData>({
        name: "",
        email: "",
        budget: "",
        date: "",
        time: "",
    });
    const [smsStep, setSmsStep] = useState<SmsStep>("idle");
    const [smsData, setSmsData] = useState<SmsData>({ name: "", phone: "", message: "" });
    const [showAboutNash, setShowAboutNash] = useState(false);
    const [chatFontSize, setChatFontSize] = useState<0 | 1 | 2>(0); // 0=xs, 1=sm, 2=base
    const fontSizeClass = ['text-xs', 'text-sm', 'text-base'][chatFontSize];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const toggleVideoRef = useRef<HTMLVideoElement>(null);
    const headerVideoRef = useRef<HTMLVideoElement>(null);
    const isStreamingRef = useRef(false);
    const streamingMsgRef = useRef<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Voice AI state
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lastSpokenMsgId = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const voiceEnabledRef = useRef(false);
    const speakTextRef = useRef<(text: string) => void>(() => { });

    // Message notification sounds
    const nashSoundRef = useRef<Howl | null>(null);
    const userSoundRef = useRef<Howl | null>(null);
    const playNashSound = useCallback(() => {
        if (!nashSoundRef.current) {
            nashSoundRef.current = new Howl({
                src: ["/sounds/nash-message.wav"],
                volume: 0.5,
                preload: true,
            });
        }
        nashSoundRef.current.play();
    }, []);
    const playUserSound = useCallback(() => {
        if (!userSoundRef.current) {
            userSoundRef.current = new Howl({
                src: ["/sounds/user-message.wav"],
                volume: 0.4,
                preload: true,
            });
        }
        userSoundRef.current.play();
    }, []);

    // Speech-to-text (mic) state
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const toggleMicRef = useRef<() => void>(() => { });

    // Speak text using ElevenLabs TTS API
    const speakText = useCallback(async (text: string, force = false) => {
        if ((!force && !voiceEnabled) || typeof window === 'undefined') return;

        // Stop any current audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Clean text — strip markdown, emojis, bullet formatting
        const cleaned = text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/[\u{1F4CC}\u{1F4E7}\u{1F4B0}\u{23F1}\u{FE0F}\u{1F4C5}\u{1F550}\u{1F4F1}\u{1F4AC}\u{2705}\u{270F}\u{FE0F}\u{2709}\u{FE0F}\u{1F4DE}\u{1F389}\u{1F44B}\u{1F9E0}\u{26A1}\u{1F6E1}\u{FE0F}\u{1F3AF}]/gu, '')
            .replace(/^[•\-]\s*/gm, '')
            .replace(/\[UNKNOWN\]/g, '')
            .replace(/\[FEATURE_REQUEST\]/g, '')
            .trim();

        if (!cleaned) return;

        setIsSpeaking(true);

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: cleaned }),
            });

            if (!res.ok) {
                console.error('TTS API error:', res.status);
                setIsSpeaking(false);
                return;
            }

            const audioBlob = await res.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                audioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                lastInputWasVoiceRef.current = false;
                // Auto-start mic after Nash asks a question
                if (cleaned.trim().endsWith('?')) {
                    setTimeout(() => toggleMicRef.current(), 400);
                }
            };

            audio.onerror = () => {
                setIsSpeaking(false);
                audioRef.current = null;
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
        } catch (err) {
            console.error('TTS playback error:', err);
            setIsSpeaking(false);
        }
    }, [voiceEnabled]);

    // Keep refs in sync
    useEffect(() => {
        voiceEnabledRef.current = voiceEnabled;
    }, [voiceEnabled]);

    useEffect(() => {
        speakTextRef.current = speakText;
    }, [speakText]);

    // Speech-to-text: toggle microphone
    const lastInputWasVoiceRef = useRef(false);
    const micStoppedManuallyRef = useRef(false);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toggleMic = useCallback(() => {
        if (isListening) {
            // User manually stopped — flag it so onend knows to send
            micStoppedManuallyRef.current = true;
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
        micStoppedManuallyRef.current = false;

        let finalTranscript = '';

        // Helper: start/restart the 3-second silence timer
        const resetSilenceTimer = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                // 3 seconds of silence — auto-send
                micStoppedManuallyRef.current = true;
                recognition.stop();
                setIsListening(false);
            }, 3000);
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interim = transcript;
                }
            }
            // Show interim results in the input while speaking
            setInput(finalTranscript || interim);
            // Reset the silence timer on every new speech result
            resetSilenceTimer();
        };

        recognition.onend = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (micStoppedManuallyRef.current) {
                // User tapped mic or silence timeout — send the message
                setIsListening(false);
                if (finalTranscript.trim()) {
                    lastInputWasVoiceRef.current = true;
                    setInput(finalTranscript.trim());
                    setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.requestSubmit();
                    }, 100);
                }
            } else {
                // Browser ended recognition (silence timeout) — restart to keep listening
                try {
                    recognition.start();
                } catch {
                    // If restart fails, just stop gracefully
                    setIsListening(false);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setIsListening(false);
                alert('Microphone access was denied. Please allow microphone access in your browser settings.');
            } else if (event.error === 'no-speech') {
                // No speech detected — silently continue listening
                console.log('No speech detected, continuing...');
            } else if (event.error === 'aborted') {
                setIsListening(false);
            }
        };

        recognition.start();
        setIsListening(true);

        // Auto-enable voice so Nash speaks his response back
        if (!voiceEnabledRef.current) {
            setVoiceEnabled(true);
        }
    }, [isListening]);

    // Keep toggleMicRef in sync
    useEffect(() => {
        toggleMicRef.current = toggleMic;
    }, [toggleMic]);

    // Stop speaking/listening when chat closes or voice is disabled
    useEffect(() => {
        if (!isOpen || !voiceEnabled) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsSpeaking(false);
        }
        if (!isOpen) {
            micStoppedManuallyRef.current = true;
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognitionRef.current?.stop();
            setIsListening(false);
            // Stop all sounds when chat is closed
            fadeOutAmbient();
            nashSoundRef.current?.stop();
            userSoundRef.current?.stop();
        }
    }, [isOpen, voiceEnabled]);

    // Close chat on page scroll (desktop only — mobile has body scroll locked)
    useEffect(() => {
        if (!isOpen || isMobile) return;
        let startY = window.scrollY;
        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 50) {
                setIsOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen, isMobile]);

    // Track mobile breakpoint
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Pause/play Nash avatar videos based on chat visibility
    // Only the visible video plays at any time — saves CPU/battery
    useEffect(() => {
        if (isOpen) {
            // Chat open: pause toggle button video (hidden behind X), play header video
            toggleVideoRef.current?.pause();
            headerVideoRef.current?.play().catch(() => { });
        } else {
            // Chat closed: play toggle button video (visible), pause header video
            toggleVideoRef.current?.play().catch(() => { });
            headerVideoRef.current?.pause();
        }
    }, [isOpen]);

    // Ambient background sound — plays when chat is open
    const ambientRef = useRef<Howl | null>(null);
    const ambientIdRef = useRef<number | undefined>(undefined);
    const ambientTarget = 0.03;
    const fadeInAmbient = useCallback(() => {
        if (!ambientRef.current) {
            ambientRef.current = new Howl({
                src: ["/AI-NASH/nash-Ambient-bgsound.mp3"],
                html5: true,
                loop: true,
                volume: 0,
                preload: true,
            });
        }
        const h = ambientRef.current;
        // If already playing, just fade up
        if (h.playing()) {
            h.fade(h.volume(), ambientTarget, 1500);
            return;
        }
        const id = h.play();
        ambientIdRef.current = id;
        h.volume(0, id);
        h.fade(0, ambientTarget, 1500, id);
    }, []);
    const fadeOutAmbient = useCallback(() => {
        const h = ambientRef.current;
        if (!h || !h.playing()) return;
        const id = ambientIdRef.current;
        h.fade(h.volume(), 0, 1000, id);
        setTimeout(() => {
            h.pause(id);
        }, 1050);
    }, []);

    // Lock body scroll on mobile when chat is open (robust for iOS Safari)
    useEffect(() => {
        if (isMobile && isOpen) {
            const scrollY = window.scrollY;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            const preventScroll = (e: TouchEvent) => {
                const target = e.target as HTMLElement;
                // Allow scrolling inside the chat messages area
                if (target.closest('[data-lenis-prevent]')) return;
                e.preventDefault();
            };
            document.addEventListener('touchmove', preventScroll, { passive: false });

            return () => {
                document.removeEventListener('touchmove', preventScroll);
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isMobile, isOpen]);

    // Close chat when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                toggleRef.current &&
                !toggleRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                fadeOutAmbient();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Auto-scroll to bottom on new messages (skip during streaming)
    useEffect(() => {
        if (isStreamingRef.current) return; // Don't auto-scroll while streaming
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);





    const addBotMessage = useCallback((content: string) => {
        const msg: Message = {
            id: Date.now().toString() + Math.random(),
            role: "assistant",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, msg]);
        playNashSound();
    }, [playNashSound]);

    const addUserMessage = useCallback((content: string) => {
        const msg: Message = {
            id: Date.now().toString() + Math.random(),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, msg]);
        playUserSound();
    }, [playUserSound]);

    // Save visitor info via cookie + server DB
    const saveVisitorMemory = useCallback(async (name: string, email: string) => {
        try {
            // Save to server (sets cookie automatically)
            await fetch("/api/chat/visitor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, action: "identify" }),
            });
            // Also keep localStorage as fast fallback
            localStorage.setItem("chat_visitor", JSON.stringify({ name, email, lastVisit: new Date().toISOString() }));
        } catch { /* silent fail */ }
    }, []);

    // Load visitor info — try server first, fall back to localStorage
    const loadVisitorMemory = useCallback(async (): Promise<{ name: string; email: string } | null> => {
        try {
            const res = await fetch("/api/chat/visitor");
            const data = await res.json();
            if (data.visitor && data.visitor.name && data.visitor.email) {
                return { name: data.visitor.name, email: data.visitor.email };
            }
        } catch { /* server unavailable */ }

        // Fallback to localStorage
        try {
            const stored = localStorage.getItem("chat_visitor");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.name && parsed.email) return { name: parsed.name, email: parsed.email };
            }
        } catch { /* localStorage unavailable */ }

        return null;
    }, []);

    // Log a contact submission to the server
    const logContactSubmission = useCallback(async () => {
        try {
            await fetch("/api/chat/visitor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "contact_submitted" }),
            });
        } catch { /* silent fail */ }
    }, []);

    // Log conversation to server
    const logConversation = useCallback(async (firstMessage: string, messageCount: number) => {
        try {
            await fetch("/api/chat/visitor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "log_conversation", firstMessage, messageCount }),
            });
        } catch { /* silent fail */ }
    }, []);

    // Handle contact flow steps
    const handleContactFlow = useCallback(
        async (userInput: string) => {
            addUserMessage(userInput);

            if (contactStep === "returning") {
                const lower = userInput.toLowerCase().trim();
                if (lower === "yes" || lower === "y" || lower === "yep" || lower === "yeah" || lower === "that's me" || lower === "thats me") {
                    // Use saved info, skip to budget
                    setTimeout(() => {
                        addBotMessage(
                            "Great, welcome back! 🎉\n\nWhat's your budget range? Design starts around $3-6k, development from $6k+. (Just a rough idea works too)"
                        );
                        setContactStep("budget");
                    }, 400);
                } else {
                    // Start fresh
                    setContactData((prev) => ({ ...prev, name: "", email: "" }));
                    setTimeout(() => {
                        addBotMessage(
                            "No worries! Let's start fresh.\n\nWhat's your name?"
                        );
                        setContactStep("name");
                    }, 400);
                }
            } else if (contactStep === "name") {
                setContactData((prev) => ({ ...prev, name: userInput }));
                setTimeout(() => {
                    addBotMessage(
                        `Nice to meet you, ${userInput}! 👋\n\nWhat's your email address so Michael can get back to you?`
                    );
                    setContactStep("email");
                }, 400);
            } else if (contactStep === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(userInput.trim())) {
                    setTimeout(() => {
                        addBotMessage(
                            "That doesn't look like a valid email. Could you double-check and try again?"
                        );
                    }, 400);
                    return;
                }
                setContactData((prev) => ({ ...prev, email: userInput.trim() }));
                setTimeout(() => {
                    addBotMessage(
                        "Thanks! What's your budget range? Design starts around $3-6k, development from $6k+. (Just a rough idea works too)"
                    );
                    setContactStep("budget");
                }, 400);
            } else if (contactStep === "budget") {
                setContactData((prev) => ({ ...prev, budget: userInput }));
                setTimeout(() => {
                    addBotMessage(
                        "Got it. What's the timeline for the project? (e.g. 2 weeks, 1 month, flexible)"
                    );
                    setContactStep("timeline");
                }, 400);
            } else if (contactStep === "timeline") {
                setContactData((prev) => ({ ...prev, timeline: userInput }));
                setTimeout(() => {
                    addBotMessage(
                        "And when are you looking to start? (e.g. ASAP, next month, Q2 2026)"
                    );
                    setContactStep("startDate");
                }, 400);
            } else if (contactStep === "startDate") {
                setContactData((prev) => {
                    const finalData = { ...prev, startDate: userInput };

                    setTimeout(() => {
                        addBotMessage(
                            `Here's what I'll send to Michael:\n\n📌 Name: ${finalData.name}\n📧 Email: ${finalData.email}\n💰 Budget: ${finalData.budget}\n⏱️ Timeline: ${finalData.timeline}\n📅 Start Date: ${finalData.startDate}\n\nLook good? Type "send" to confirm or "edit" to start over.`
                        );
                        setContactStep("confirm");
                    }, 400);

                    return finalData;
                });
            } else if (contactStep === "confirm") {
                const lower = userInput.toLowerCase().trim();
                if (lower === "send" || lower === "yes" || lower === "y" || lower === "confirm") {
                    setContactStep("sent");
                    setIsLoading(true);

                    try {
                        // Pull latest data from state to avoid stale closure
                        let latestData = contactData;
                        setContactData((prev) => { latestData = prev; return prev; });

                        const res = await fetch("/api/chat/contact", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(latestData),
                        });

                        if (res.ok) {
                            // Save to memory for next time
                            saveVisitorMemory(contactData.name, contactData.email);
                            logContactSubmission();
                            setTimeout(() => {
                                addBotMessage(
                                    "✅ Message sent! Michael will get back to you soon.\n\nIs there anything else I can help with?"
                                );
                                setContactStep("idle");
                                setContactData({ name: "", email: "", budget: "", timeline: "", startDate: "" });
                            }, 300);
                        } else {
                            setTimeout(() => {
                                addBotMessage(
                                    "Hmm, there was an issue sending the email. You can reach Michael directly at mikeyscimeca.dev@gmail.com."
                                );
                                setContactStep("idle");
                            }, 300);
                        }
                    } catch {
                        setTimeout(() => {
                            addBotMessage(
                                "Sorry, something went wrong. You can email Michael directly at mikeyscimeca.dev@gmail.com."
                            );
                            setContactStep("idle");
                        }, 300);
                    } finally {
                        setIsLoading(false);
                    }
                } else if (lower === "edit" || lower === "no" || lower === "restart") {
                    setContactData({ name: "", email: "", budget: "", timeline: "", startDate: "" });
                    setTimeout(() => {
                        addBotMessage("No problem! Let's start over.\n\nWhat's your name?");
                        setContactStep("name");
                    }, 400);
                } else {
                    setTimeout(() => {
                        addBotMessage(
                            'Just type "send" to confirm or "edit" to start over.'
                        );
                    }, 400);
                }
            }
        },
        [contactStep, contactData, addBotMessage, addUserMessage, saveVisitorMemory, logContactSubmission]
    );

    // Start the contact flow — check memory first
    const startContactFlow = useCallback(async () => {
        setShowQuickReplies(false);
        addUserMessage("I'd like to send Michael a message");

        const memory = await loadVisitorMemory();
        if (memory && memory.name && memory.email) {
            // Returning visitor — pre-fill and ask to confirm
            setContactData((prev) => ({ ...prev, name: memory.name, email: memory.email }));
            setContactStep("returning");
            const firstName = memory.name.split(" ")[0];
            setTimeout(() => {
                addBotMessage(
                    `Hey ${firstName}! 👋 Welcome back. Is this still you?\n\n📌 ${memory.name}\n📧 ${memory.email}\n\nType "yes" to continue or "no" to update your info.`
                );
            }, 400);
        } else {
            // New visitor
            setContactStep("name");
            setTimeout(() => {
                addBotMessage(
                    "I'd be happy to help you reach Michael! Let me grab a few details.\n\nWhat's your name?"
                );
            }, 400);
        }
    }, [addBotMessage, addUserMessage, loadVisitorMemory]);

    // Handle SMS flow steps
    const handleSmsFlow = useCallback(
        async (userInput: string) => {
            addUserMessage(userInput.trim());

            if (smsStep === "name") {
                setSmsData((prev) => ({ ...prev, name: userInput.trim() }));
                setTimeout(() => {
                    addBotMessage("What's your phone number so Michael can text you back?");
                    setSmsStep("phone");
                }, 400);
            } else if (smsStep === "phone") {
                const digits = userInput.replace(/\D/g, "");
                if (digits.length < 10) {
                    setTimeout(() => {
                        addBotMessage("That doesn't look like a valid phone number.\n\nPlease enter a 10-digit number (e.g. 555-123-4567).");
                    }, 400);
                } else {
                    setSmsData((prev) => ({ ...prev, phone: userInput.trim() }));
                    setTimeout(() => {
                        addBotMessage("Got it!\n\nWhat message would you like me to text Michael?");
                        setSmsStep("message");
                    }, 400);
                }
            } else if (smsStep === "message") {
                setSmsData((prev) => {
                    const finalData = { ...prev, message: userInput.trim() };
                    setTimeout(() => {
                        addBotMessage(
                            `Here's what I'll text Michael:\n\n📌 From: ${finalData.name}\n📱 Phone: ${finalData.phone}\n💬 Message: ${finalData.message}\n\nLook good?`
                        );
                        setSmsStep("confirm");
                    }, 400);
                    return finalData;
                });
            } else if (smsStep === "confirm") {
                const lower = userInput.toLowerCase().trim();
                if (lower === "send" || lower === "yes" || lower === "y" || lower === "confirm") {
                    setSmsStep("sent");
                    setIsLoading(true);
                    try {
                        const res = await fetch("/api/sms", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(smsData),
                        });
                        if (res.ok) {
                            setTimeout(() => {
                                addBotMessage("✅ Text sent! Michael will get back to you soon.\n\nIs there anything else I can help with?");
                                setSmsStep("idle");
                                setSmsData({ name: "", phone: "", message: "" });
                            }, 300);
                        } else {
                            setTimeout(() => {
                                addBotMessage("Hmm, there was an issue sending the text. You can reach Michael directly at mikeyscimeca.dev@gmail.com.");
                                setSmsStep("idle");
                            }, 300);
                        }
                    } catch {
                        setTimeout(() => {
                            addBotMessage("Sorry, something went wrong. You can email Michael directly at mikeyscimeca.dev@gmail.com.");
                            setSmsStep("idle");
                        }, 300);
                    } finally {
                        setIsLoading(false);
                    }
                } else if (lower === "edit" || lower === "no" || lower === "restart") {
                    setSmsData({ name: "", phone: "", message: "" });
                    setTimeout(() => {
                        addBotMessage("No problem! Let's start over.\n\nWhat's your name?");
                        setSmsStep("name");
                    }, 400);
                } else {
                    setTimeout(() => {
                        addBotMessage('Just type "send" to confirm or "edit" to start over.');
                    }, 400);
                }
            }
        },
        [smsStep, smsData, addBotMessage, addUserMessage]
    );

    // Start the SMS flow
    const startSmsFlow = useCallback(async () => {
        addUserMessage("I'd like to text Michael");

        const memory = await loadVisitorMemory();
        if (memory && memory.name) {
            setSmsData((prev) => ({ ...prev, name: memory.name }));
            setSmsStep("phone");
            const firstName = memory.name.split(" ")[0];
            setTimeout(() => {
                addBotMessage(`Hey ${firstName}! 👋\n\nWhat's your phone number so Michael can text you back?`);
            }, 400);
        } else {
            setSmsStep("name");
            setTimeout(() => {
                addBotMessage("I'll text Michael for you!\n\nWhat's your name?");
            }, 400);
        }
    }, [addBotMessage, addUserMessage, loadVisitorMemory]);

    // Show the About Nash overlay
    const handleAboutNash = useCallback(() => {
        setShowAboutNash(true);
    }, []);

    // Cancel any active flow (contact/schedule/SMS)
    const cancelFlow = useCallback(() => {
        const wasInFlow = contactStep !== "idle" || scheduleStep !== "idle" || smsStep !== "idle";
        setContactStep("idle");
        setScheduleStep("idle");
        setSmsStep("idle");
        setContactData({ name: "", email: "", budget: "", timeline: "", startDate: "" });
        setScheduleData({ name: "", email: "", budget: "", date: "", time: "" });
        setSmsData({ name: "", phone: "", message: "" });
        setInput("");
        if (wasInFlow) {
            setTimeout(() => {
                addBotMessage("No problem — cancelled! Is there anything else I can help with?");
            }, 200);
        }
    }, [contactStep, scheduleStep, smsStep, addBotMessage]);

    // Start the schedule-a-call flow
    const startScheduleFlow = useCallback(async () => {
        setShowQuickReplies(false);
        addUserMessage("I'd like to schedule a call");

        const memory = await loadVisitorMemory();
        if (memory && memory.name && memory.email) {
            setScheduleData((prev) => ({ ...prev, name: memory.name, email: memory.email }));
            setScheduleStep("returning");
            const firstName = memory.name.split(" ")[0];
            setTimeout(() => {
                addBotMessage(
                    `Hey ${firstName}! 👋 Welcome back. Is this still you?\n\n📌 ${memory.name}\n📧 ${memory.email}\n\nType \"yes\" to continue or \"no\" to update your info.`
                );
            }, 400);
        } else {
            setScheduleStep("name");
            setTimeout(() => {
                addBotMessage(
                    "Let's get a call on the calendar!\n**What's your name?**"
                );
            }, 400);
        }
    }, [addBotMessage, addUserMessage, loadVisitorMemory]);

    // Handle schedule flow steps
    const handleScheduleFlow = useCallback(
        async (userInput: string) => {
            addUserMessage(userInput);

            if (scheduleStep === "returning") {
                const lower = userInput.toLowerCase().trim();
                if (lower === "yes" || lower === "y" || lower === "yep" || lower === "yeah" || lower === "that's me" || lower === "thats me") {
                    setTimeout(() => {
                        addBotMessage("**What's your budget range?**\n\n• Under $6k (Design / simple site)\n• $6k–$12k\n• $12k–$18k\n• $18k–$36k\n• $36k+");
                        setScheduleStep("budget");
                    }, 400);
                } else {
                    setScheduleData({ name: "", email: "", budget: "", date: "", time: "" });
                    setTimeout(() => {
                        addBotMessage("No problem! Let's start fresh.\n\n**What's your name?**");
                        setScheduleStep("name");
                    }, 400);
                }
            } else if (scheduleStep === "name") {
                setScheduleData((prev) => ({ ...prev, name: userInput }));
                setTimeout(() => {
                    addBotMessage("**What's your email address?**");
                    setScheduleStep("email");
                }, 400);
            } else if (scheduleStep === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(userInput.trim())) {
                    setTimeout(() => {
                        addBotMessage("That doesn't look like a valid email. Could you try again?");
                    }, 400);
                    return;
                }
                setScheduleData((prev) => ({ ...prev, email: userInput.trim() }));
                setTimeout(() => {
                    addBotMessage("**What's your budget range?**\n\n• Under $6k (Design / simple site)\n• $6k–$12k\n• $12k–$18k\n• $18k–$36k\n• $36k+");
                    setScheduleStep("budget");
                }, 400);
            } else if (scheduleStep === "budget") {
                setScheduleData((prev) => ({ ...prev, budget: userInput }));
                const dates: string[] = [];
                const d = new Date();
                while (dates.length < 5) {
                    d.setDate(d.getDate() + 1);
                    if (d.getDay() !== 0 && d.getDay() !== 6) {
                        dates.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
                    }
                }
                const dateList = dates.map(dt => `• ${dt}`).join('\n');
                setTimeout(() => {
                    addBotMessage(`**What date works for you?**\n\n${dateList}\n• Other`);
                    setScheduleStep("date");
                }, 400);
            } else if (scheduleStep === "date") {
                if (userInput.toLowerCase() === "other") {
                    setTimeout(() => {
                        addBotMessage("**What date works best?** Just type it in (e.g. March 5, next Thursday)");
                        setScheduleStep("dateCustom");
                    }, 400);
                    return;
                }
                setScheduleData((prev) => ({ ...prev, date: parseNaturalDate(userInput) }));
                const timeList = TIME_SLOTS.map(t => `• ${t}`).join('\n');
                setTimeout(() => {
                    addBotMessage(`**What time works?** (Central Time)\n\n${timeList}`);
                    setScheduleStep("time");
                }, 400);
            } else if (scheduleStep === "dateCustom") {
                setScheduleData((prev) => ({ ...prev, date: parseNaturalDate(userInput) }));
                const timeList = TIME_SLOTS.map(t => `• ${t}`).join('\n');
                setTimeout(() => {
                    addBotMessage(`**What time works?** (Central Time)\n\n${timeList}`);
                    setScheduleStep("time");
                }, 400);
            } else if (scheduleStep === "time") {
                setScheduleData((prev) => {
                    const finalData = { ...prev, time: userInput };
                    setTimeout(() => {
                        addBotMessage(
                            `Here's your call details:\n\n📌 Name: ${finalData.name}\n📧 Email: ${finalData.email}\n💰 Budget: ${finalData.budget}\n📅 Date: ${finalData.date}\n🕐 Time: ${finalData.time} CT\n\nLook good?\n\n• ✅ Send\n• ✏️ Edit`
                        );
                        setScheduleStep("confirm");
                    }, 400);
                    return finalData;
                });
            } else if (scheduleStep === "confirm") {
                const lower = userInput.toLowerCase().trim().replace(/^[✅✏️\s]+/, '');
                if (lower === "send" || lower === "yes" || lower === "y" || lower === "confirm") {
                    setScheduleStep("sent");
                    setIsLoading(true);

                    try {
                        // Pull latest data from state to avoid stale closure
                        let latestData = scheduleData;
                        setScheduleData((prev) => { latestData = prev; return prev; });

                        const res = await fetch("/api/schedule", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(latestData),
                        });

                        if (res.ok) {
                            saveVisitorMemory(scheduleData.name, scheduleData.email);
                            logContactSubmission();
                            setTimeout(() => {
                                addBotMessage(
                                    "✅ Call scheduled! Michael will send you a calendar invite soon.\n\nIs there anything else I can help with?"
                                );
                                setScheduleStep("idle");
                                setScheduleData({ name: "", email: "", budget: "", date: "", time: "" });
                            }, 300);
                        } else {
                            setTimeout(() => {
                                addBotMessage(
                                    "Hmm, there was an issue booking the call. You can reach Michael directly at mikeyscimeca.dev@gmail.com."
                                );
                                setScheduleStep("idle");
                            }, 300);
                        }
                    } catch {
                        setTimeout(() => {
                            addBotMessage(
                                "Sorry, something went wrong. You can email Michael directly at mikeyscimeca.dev@gmail.com."
                            );
                            setScheduleStep("idle");
                        }, 300);
                    } finally {
                        setIsLoading(false);
                    }
                } else if (lower === "edit" || lower === "no" || lower === "restart") {
                    setScheduleData({ name: "", email: "", budget: "", date: "", time: "" });
                    setTimeout(() => {
                        addBotMessage("No problem! Let's start over.\n\n**What's your name?**");
                        setScheduleStep("name");
                    }, 400);
                } else {
                    setTimeout(() => {
                        addBotMessage(
                            'Just type \"send\" to confirm or \"edit\" to start over.'
                        );
                    }, 400);
                }
            }
        },
        [scheduleStep, scheduleData, addBotMessage, addUserMessage, saveVisitorMemory, logContactSubmission]
    );

    // Detect if the user wants to send an email / contact Michael
    const isContactIntent = useCallback((text: string) => {
        const lower = text.toLowerCase();
        const contactKeywords = [
            "email", "send a message", "send message", "contact",
            "reach out", "get in touch", "hire", "reach michael",
            "reach mikey", "message michael", "message mikey",
            "email michael", "email mikey", "write to", "talk to",
            "send him", "send you",
        ];
        return contactKeywords.some((kw) => lower.includes(kw));
    }, []);

    // Detect if the user wants to schedule a call
    const isScheduleIntent = useCallback((text: string) => {
        const lower = text.toLowerCase();
        const scheduleKeywords = [
            "schedule", "book a call", "book call", "strategy call",
            "discovery call", "set up a call", "set up call",
            "meeting", "calendar", "schedule a call",
            "book a meeting", "call with michael", "call with mikey",
        ];
        return scheduleKeywords.some((kw) => lower.includes(kw));
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            // If we're in an SMS flow, handle it
            if (smsStep !== "idle") {
                handleSmsFlow(text);
                setInput("");
                return;
            }

            // If we're in a schedule flow, handle it
            if (scheduleStep !== "idle") {
                handleScheduleFlow(text);
                setInput("");
                return;
            }

            // If we're in a contact flow, handle it differently
            if (contactStep !== "idle") {
                handleContactFlow(text);
                setInput("");
                return;
            }

            // Detect schedule intent and start the schedule flow
            if (isScheduleIntent(text)) {
                setInput("");
                setShowQuickReplies(false);

                const memory = await loadVisitorMemory();
                if (memory && memory.name && memory.email) {
                    addUserMessage(text.trim());
                    setScheduleData((prev) => ({ ...prev, name: memory.name, email: memory.email }));
                    setScheduleStep("returning");
                    const firstName = memory.name.split(" ")[0];
                    setTimeout(() => {
                        addBotMessage(
                            `Sure! Hey ${firstName}, welcome back! 👋 Is this still you?\n\n📌 ${memory.name}\n📧 ${memory.email}\n\nType "yes" to continue or "no" to update your info.`
                        );
                    }, 400);
                } else {
                    addUserMessage(text.trim());
                    setScheduleStep("name");
                    setTimeout(() => {
                        addBotMessage(
                            "Let's get a call on the calendar!\n**What's your name?**"
                        );
                    }, 400);
                }
                return;
            }

            // Detect contact intent and start the form flow
            if (isContactIntent(text)) {
                setInput("");
                setShowQuickReplies(false);

                const memory = await loadVisitorMemory();
                if (memory && memory.name && memory.email) {
                    addUserMessage(text.trim());
                    setContactData((prev) => ({ ...prev, name: memory.name, email: memory.email }));
                    setContactStep("returning");
                    const firstName = memory.name.split(" ")[0];
                    setTimeout(() => {
                        addBotMessage(
                            `Sure! Hey ${firstName}, welcome back! 👋 Is this still you?\n\n📌 ${memory.name}\n📧 ${memory.email}\n\nType "yes" to continue or "no" to update your info.`
                        );
                    }, 400);
                } else {
                    addUserMessage(text.trim());
                    setContactStep("name");
                    setTimeout(() => {
                        addBotMessage(
                            "Sure! I'll get that message to Michael. Let me grab a few details first.\n\nWhat's your name?"
                        );
                    }, 400);
                }
                return;
            }

            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: text.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            playUserSound();
            setInput("");
            setShowQuickReplies(false);
            setIsLoading(true);

            try {
                const chatHistory = [...messages, userMessage].map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: chatHistory }),
                });

                if (!res.ok || !res.body) {
                    const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content:
                            "Sorry, I'm having trouble connecting right now. You can reach Michael directly at mikeyscimeca.dev@gmail.com.",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                    setIsLoading(false);
                    return;
                }

                // Stream response word-by-word, scroll pinned to top of message
                const assistantId = (Date.now() + 1).toString();
                isStreamingRef.current = true;
                streamingMsgRef.current = assistantId;
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let fullContent = "";
                let firstChunk = true;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") break;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    fullContent += parsed.text;
                                    const streamedContent = fullContent;

                                    if (firstChunk) {
                                        // Add message, hide dots, scroll to top of this message
                                        setMessages((prev) => [...prev, {
                                            id: assistantId,
                                            role: "assistant" as const,
                                            content: streamedContent,
                                            timestamp: new Date(),
                                        }]);
                                        setIsLoading(false);
                                        firstChunk = false;
                                        playNashSound();
                                        // Scroll to the top of Nash's new message after it renders
                                        requestAnimationFrame(() => {
                                            const msgEl = document.getElementById(`msg-${assistantId}`);
                                            if (msgEl && chatBodyRef.current) {
                                                const container = chatBodyRef.current;
                                                const msgTop = msgEl.offsetTop - container.offsetTop;
                                                container.scrollTo({ top: msgTop - 8, behavior: "smooth" });
                                            }
                                        });
                                    } else {
                                        // Update message in-place (no scroll)
                                        setMessages((prev) => prev.map((m) =>
                                            m.id === assistantId ? { ...m, content: streamedContent } : m
                                        ));
                                    }
                                }
                            } catch {
                                // skip malformed chunks
                            }
                        }
                    }
                }

                // Streaming complete — resume normal auto-scroll
                isStreamingRef.current = false;
                streamingMsgRef.current = null;

                // Voice AI: speak the completed response (fire early, before marker checks)
                if (lastInputWasVoiceRef.current && fullContent.trim()) {
                    const cleanedForSpeech = fullContent
                        .replace(/\s*\[UNKNOWN\]\s*/g, "")
                        .replace(/\s*\[FEATURE_REQUEST\]\s*/g, "")
                        .trim();
                    if (cleanedForSpeech) {
                        speakTextRef.current(cleanedForSpeech);
                    }
                }

                // Handle edge case: no content received
                if (firstChunk) {
                    const assistantMessage: Message = {
                        id: assistantId,
                        role: "assistant",
                        content: "Sorry, I couldn't generate a response. Try again or reach Michael at mikeyscimeca.dev@gmail.com.",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                    setIsLoading(false);
                }

                // Check for [UNKNOWN] marker — Nash didn't know the answer
                setMessages((prev) => {
                    const assistantMsg = prev.find((m) => m.id === assistantId);
                    if (assistantMsg?.content.includes("[UNKNOWN]")) {
                        // Send the unanswered question to Michael via ntfy + email
                        fetch("/api/unknown-question", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ question: userMessage.content, type: "unknown" }),
                        }).catch(console.error);

                        // Strip the [UNKNOWN] marker from the displayed message
                        return prev.map((m) =>
                            m.id === assistantId
                                ? { ...m, content: m.content.replace(/\s*\[UNKNOWN\]\s*/g, "").trim() }
                                : m
                        );
                    }

                    // Check for [FEATURE_REQUEST] marker — visitor asked about a service not offered
                    if (assistantMsg?.content.includes("[FEATURE_REQUEST]")) {
                        fetch("/api/unknown-question", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ question: userMessage.content, type: "feature_request" }),
                        }).catch(console.error);

                        // Strip the [FEATURE_REQUEST] marker from the displayed message
                        return prev.map((m) =>
                            m.id === assistantId
                                ? { ...m, content: m.content.replace(/\s*\[FEATURE_REQUEST\]\s*/g, "").trim() }
                                : m
                        );
                    }

                    return prev;
                });

                // Log the conversation to the server
                const userMsgs = [...messages, userMessage];
                const firstUserMsg = userMsgs.find((m) => m.role === "user");
                if (firstUserMsg) {
                    logConversation(firstUserMsg.content, userMsgs.length + 1);
                }
            } catch {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        "Sorry, something went wrong. Feel free to email Michael at mikeyscimeca.dev@gmail.com.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
                setIsLoading(false);
            }
        },
        [messages, isLoading, contactStep, scheduleStep, handleContactFlow, handleScheduleFlow, isContactIntent, isScheduleIntent, addUserMessage, addBotMessage, loadVisitorMemory, logConversation]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (message: string) => {
        sendMessage(message);
    };

    // Placeholder text changes based on contact step
    const getPlaceholder = () => {
        // Schedule flow placeholders
        if (scheduleStep !== "idle") {
            switch (scheduleStep) {
                case "returning": return 'Type "yes" or "no"...';
                case "name": return "Enter your name...";
                case "email": return "Enter your email...";
                case "budget": return "e.g. $5k-10k, $10k+...";
                case "date": return "Pick a date or type one...";
                case "dateCustom": return "e.g. March 5, next Thursday...";
                case "time": return "e.g. 10:00 AM...";
                case "confirm": return 'Type "send" or "edit"...';
                default: return "Chat with Nash...";
            }
        }

        switch (contactStep) {
            case "returning":
                return 'Type "yes" or "no"...';
            case "name":
                return "Enter your name...";
            case "email":
                return "Enter your email...";
            case "budget":
                return "e.g. $3k-6k design, $6k-18k dev...";
            case "timeline":
                return "e.g. 2 weeks, 1 month...";
            case "startDate":
                return "e.g. ASAP, March 2026...";
            case "confirm":
                return 'Type "send" or "edit"...';
            default:
        }

        // SMS flow placeholders
        if (smsStep !== "idle") {
            switch (smsStep) {
                case "name": return "Enter your name...";
                case "phone": return "Enter your phone number...";
                case "message": return "Type your message...";
                case "confirm": return 'Type "send" or "edit"...';
                default: return "Chat with Nash...";
            }
        }

        switch ("default") {
            default:
                return "Chat with Nash...";
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <div
                ref={toggleRef}
                onClick={() => {
                    const next = !isOpen;
                    setIsOpen(next);
                    // Fade ambient sound in/out
                    if (next) {
                        fadeInAmbient();
                        setOpenCount(c => {
                            // Only play the sound on the very first open (welcome message)
                            if (c === 0) {
                                setTimeout(() => playNashSound(), 400);
                            }
                            return c + 1;
                        });
                    } else {
                        fadeOutAmbient();
                    }
                }}
                className={`fixed z-[9998] w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isOpen ? '' : ''} ${isMobile && isOpen ? 'bottom-3 right-[6px]' : 'bottom-6 right-[26px]'}`}
                style={{
                    background: isOpen ? 'transparent' : '#0150fe',
                    transition: 'background 0.4s, transform 0.3s',
                    boxShadow: isOpen ? 'none' : '0 0 20px rgba(1, 80, 254, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
                role="button"
                tabIndex={0}
                aria-label={isOpen ? "Close chat" : "Open chat"}
                id="chat-toggle"
            >
                {/* Pulse ring — only when closed */}
                {!isOpen && (
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            border: '2px solid rgba(1, 80, 254, 0.6)',
                            animation: 'chatPulseRing 2s ease-out infinite',
                        }}
                    />
                )}
                <div
                    className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center relative"
                    style={{
                        border: isOpen ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                    }}
                >
                    {/* Nash video — always mounted, paused when chat is open */}
                    <video
                        ref={toggleVideoRef}
                        className="w-full h-full object-cover"
                        src="/AI-NASH/NASH-VIDEO-AVATAR.mp4?v=3"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <div
                        className="group/close absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                        style={{
                            background: "#0c0b31ff",
                            opacity: isOpen ? 1 : 0,
                            pointerEvents: isOpen ? "auto" : "none",
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#57576c"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="transition-colors duration-200 group-hover/close:[stroke:white]"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* "I'M NASH" label */}
            {!isOpen && (
                <div className="fixed bottom-[86px] right-4 z-[9998] pointer-events-none">
                    <div className="relative">
                        <div
                            className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wide text-black whitespace-nowrap shadow-md"
                            style={{ background: "#ffffff" }}
                        >
                            HI, I&apos;M NASH
                        </div>
                        <div
                            className="absolute -bottom-1 right-3 w-2 h-2 rotate-45"
                            style={{ background: "#ffffff" }}
                        />
                    </div>
                </div>
            )}


            {/* Chat Panel */}
            <div
                ref={panelRef}
                className={`fixed z-[9997] transition-opacity duration-300 ease-out ${isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                style={{
                    ...(isMobile
                        ? {
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            height: "100%",
                            maxHeight: "100dvh",
                            overflow: "hidden",
                        }
                        : {
                            bottom: "0px",
                            right: "0px",
                            width: "min(455px, calc(100vw - 24px))",
                            height: "min(620px, calc(100vh - 24px))",
                            paddingBottom: "20px",
                            paddingRight: "24px",
                        }),
                }}
            >
                <div
                    className={`flex flex-col h-full overflow-hidden ${isMobile ? "" : "rounded-2xl border border-white/10 border-b-0 border-r-0"}`}
                    style={{
                        background: "rgba(10, 10, 12, 0.95)",
                        backdropFilter: "blur(40px)",
                        boxShadow:
                            "0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                        position: "relative",
                    }}
                >
                    {/* Animated gradient background — only renders when chat is open */}
                    {isOpen && (
                        <div className={`absolute inset-0 z-0 pointer-events-none opacity-95 overflow-hidden ${isMobile ? "" : "rounded-2xl"}`}>
                            <GradientBackground disableInteractive />
                            {CHAT_BLOBS.map((blob, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        width: blob.size, height: blob.size,
                                        opacity: blob.opacity,
                                        background: `radial-gradient(circle, ${blob.color} 0%, transparent 60%)`,
                                        filter: "blur(60px)",
                                        top: blob.top, left: blob.left, bottom: blob.bottom, right: blob.right,
                                        animation: `${blob.anim} ease-in-out infinite alternate`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    {/* Header */}
                    <div className="relative z-10 flex items-center gap-3 px-4 py-3" style={isMobile ? { paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' } : undefined} >
                        <div className="relative">
                            <video ref={headerVideoRef} className={`w-10 h-10 rounded-full object-contain bg-[#0150fe] ${isSpeaking ? 'ring-2 ring-[#0150fe]/60' : ''}`} style={isSpeaking ? { animation: 'nashSpeakPulse 1.5s ease-in-out infinite' } : undefined} src="/AI-NASH/NASH-VIDEO-AVATAR.mp4?v=3" loop muted playsInline />
                            {isSpeaking && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#0150fe] flex items-center justify-center">
                                    <div className="flex items-end gap-[1px] h-2">
                                        <div className="w-[2px] bg-white rounded-full" style={{ animation: 'voiceBar1 0.6s ease-in-out infinite', height: '4px' }} />
                                        <div className="w-[2px] bg-white rounded-full" style={{ animation: 'voiceBar2 0.6s ease-in-out infinite 0.15s', height: '6px' }} />
                                        <div className="w-[2px] bg-white rounded-full" style={{ animation: 'voiceBar3 0.6s ease-in-out infinite 0.3s', height: '3px' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-semibold text-sm">Nash</div>
                            <div className="text-white/40 text-[10px]">{isSpeaking ? 'Speaking...' : 'AI Assistant'}</div>
                        </div>
                        <div className="flex items-center gap-2">


                            <div className="flex items-baseline gap-1">
                                <button
                                    onClick={() => setChatFontSize((prev) => Math.max(0, prev - 1) as 0 | 1 | 2)}
                                    className={`text-[11px] font-semibold transition-all duration-200 cursor-pointer pb-0.5 border-b ${chatFontSize === 0 ? 'text-white border-white/40' : 'text-white/40 border-transparent hover:text-white'}`}
                                    aria-label="Decrease font size"
                                >
                                    A
                                </button>
                                <button
                                    onClick={() => setChatFontSize((prev) => Math.min(2, prev + 1) as 0 | 1 | 2)}
                                    className={`text-[15px] font-semibold transition-all duration-200 cursor-pointer pb-0.5 border-b ${chatFontSize >= 1 ? 'text-white border-white/40' : 'text-white/40 border-transparent hover:text-white'}`}
                                    aria-label="Increase font size"
                                >
                                    A
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={chatBodyRef}
                        data-lenis-prevent
                        className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-[24px] after:content-['']"
                        style={{ scrollBehavior: "smooth", overscrollBehavior: "contain" }}
                    >
                        {/* Welcome message - always visible */}
                        <div className="space-y-4" key={`welcome-${openCount}`}>
                            <div style={{ animation: "chatMsgFadeIn 0.4s ease-out 0.3s both" }}>
                                <div
                                    className={`relative rounded-2xl px-4 py-3 pb-7 ${fontSizeClass} text-white/90 leading-relaxed max-w-[85%]`}
                                    style={{ background: "rgba(255, 255, 255, 0.07)", boxShadow: "0 2px 12px rgba(0, 0, 0, 0.25)" }}
                                >
                                    Hi, I&apos;m Nash — Mikey&apos;s AI partner. I can tell you
                                    about his work, skills, services, or help you get in touch.
                                    What would you like to know?
                                    <SpeakerButton
                                        isSpeaking={isSpeaking}
                                        onToggle={() => {
                                            if (isSpeaking) {
                                                if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
                                                setIsSpeaking(false);
                                            } else {
                                                speakText("Hi, I'm Nash — Mikey's AI partner. I can tell you about his work, skills, services, or help you get in touch. What would you like to know?", true);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-[11px] text-white/30 mt-1 ml-1">Nash</div>
                            </div>

                            {/* Quick Replies - Jump to a Topic */}
                            <div className="mt-2">
                                <div
                                    className="text-[10px] font-semibold tracking-[0.15em] text-white/25 uppercase mb-3 ml-1"
                                    style={{ animation: `chatMsgFadeIn 0.3s ease-out 0.55s both` }}
                                >
                                    Jump to a topic
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUICK_REPLIES.map((qr, i) => (
                                        <button
                                            key={qr.label}
                                            onClick={() => handleQuickReply(qr.message)}
                                            className={`px-3 py-2.5 rounded-full text-xs font-medium border transition-all duration-200 ${qr.label.includes('Book')
                                                ? 'border-[#544fd4]/50 text-[#a78bfa] hover:border-[#544fd4]/70 hover:bg-[#544fd4]/10'
                                                : 'border-white/10 text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.04]'
                                                }`}
                                            style={{ animation: `chatMsgFadeIn 0.3s ease-out ${0.6 + i * 0.08}s both` }}
                                        >
                                            {qr.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Action buttons — separate row */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button
                                        onClick={startContactFlow}
                                        className="px-3 py-2.5 rounded-full text-xs font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/[0.08] hover:bg-emerald-500/15 hover:border-emerald-400/60 transition-all duration-200"
                                        style={{ animation: `chatMsgFadeIn 0.3s ease-out ${0.6 + QUICK_REPLIES.length * 0.08}s both` }}
                                    >
                                        ✉️ Quick email
                                    </button>
                                    <button
                                        onClick={handleAboutNash}
                                        className="px-3 py-2.5 rounded-full text-xs font-bold border border-amber-500/40 text-amber-400 bg-amber-500/[0.08] hover:bg-amber-500/15 hover:border-amber-400/60 transition-all duration-200 flex items-center justify-center gap-1.5"
                                        style={{ animation: `chatMsgFadeIn 0.3s ease-out ${0.6 + (QUICK_REPLIES.length + 1) * 0.08}s both` }}
                                    >
                                        <img src="/AI-NASH/nash-profile-img.jpg" alt="Nash" className="w-4 h-4 rounded-full object-cover" /> About Nash
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat messages */}
                        {messages.map((msg, idx) => (
                            <React.Fragment key={msg.id}>
                                {/* Show scheduling indicator above first bot reply in schedule flow */}
                                {scheduleStep !== "idle" && msg.role === "assistant" && idx > 0 && messages[idx - 1]?.role === "user" && idx === messages.length - 1 && (
                                    <div className="flex justify-start gap-2 flex-wrap mb-1">
                                        <div className="relative px-3 py-1.5 rounded-full text-xs font-medium text-blue-400 cursor-default">
                                            <div
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    padding: "1.5px",
                                                    background: "conic-gradient(from var(--border-angle), transparent 60%, #3b82f6 80%, #60a5fa 100%)",
                                                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                                    maskComposite: "exclude",
                                                    WebkitMaskComposite: "xor",
                                                    animation: "borderTravel 2s linear infinite",
                                                }}
                                            />
                                            📞 Scheduling a call...
                                        </div>
                                    </div>
                                )}
                                <div
                                    id={`msg-${msg.id}`}
                                    className={`${msg.role === "user" ? "flex flex-col items-end" : ""}`}
                                    style={{
                                        animation: `${msg.role === "assistant" ? "chatMsgFadeIn" : "msgSlideInRight"} 0.3s ease-out both`,
                                    }}
                                >
                                    <div
                                        className={`relative rounded-2xl px-3 py-2 ${msg.role === "assistant" ? "pb-7" : ""} ${fontSizeClass} leading-relaxed max-w-[85%] ${msg.role === "user"
                                            ? "text-white"
                                            : "text-white/90"
                                            }`}
                                        style={{
                                            background:
                                                msg.role === "user"
                                                    ? "linear-gradient(135deg, #0158ff 0%, #4a00e0 100%)"
                                                    : "rgba(255, 255, 255, 0.07)",
                                        }}
                                    >
                                        {msg.content.split("\n").map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line.startsWith("• ") && msg.role === "assistant" ? (
                                                    <button
                                                        className="inline-block mr-1.5 mb-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-400/60 transition-all duration-150 cursor-pointer"
                                                        onClick={() => sendMessage(line.replace("• ", ""))}
                                                    >
                                                        {line.replace("• ", "")}
                                                    </button>
                                                ) : (
                                                    line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                        part.startsWith("**") && part.endsWith("**") ? (
                                                            <strong key={j} className="font-semibold text-white text-sm">{part.slice(2, -2)}</strong>
                                                        ) : (
                                                            <React.Fragment key={j}>{part}</React.Fragment>
                                                        )
                                                    )
                                                )}
                                                {!line.startsWith("• ") && i < msg.content.split("\n").length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                        {msg.role === "assistant" && (
                                            <SpeakerButton
                                                isSpeaking={isSpeaking}
                                                onToggle={() => {
                                                    if (isSpeaking) {
                                                        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
                                                        setIsSpeaking(false);
                                                    } else {
                                                        speakText(msg.content, true);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className={`text-[11px] mt-[8px] leading-tight ${msg.role === "user" ? "mr-1 text-right text-[#a78bfa]" : "ml-1 text-[#60a5fa]"}`}>
                                        {msg.role === "user" ? "You" : "Nash"}
                                        {msg.role === "user" && (
                                            <div
                                                className="mt-[-1px]"
                                                style={{ animation: "deliveredFade 0.8s ease-out both" }}
                                            >
                                                <span className="text-[11px] text-white/45">
                                                    ✓ Delivered
                                                </span>
                                            </div>
                                        )}
                                        {idx === messages.length - 1 && msg.role === "assistant" && (
                                            <div className="mt-[-1px]">
                                                <span className="text-[11px] text-white/45">just now</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Confirm action buttons */}
                        {(contactStep === "confirm" || scheduleStep === "confirm" || smsStep === "confirm") && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => sendMessage("send")}
                                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#0158ff] text-white hover:bg-[#0140cc] transition-all duration-200"
                                >
                                    ✓ Send
                                </button>
                                <button
                                    onClick={() => sendMessage("edit")}
                                    className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all duration-200"
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        )}

                        {/* Action buttons (only when idle) */}
                        {messages.length > 0 &&
                            contactStep === "idle" &&
                            scheduleStep === "idle" &&
                            smsStep === "idle" &&
                            !isLoading &&
                            messages[messages.length - 1]?.role === "assistant" && (
                                <div className="flex justify-start gap-2 flex-wrap">
                                    <button onClick={startScheduleFlow} className="px-3 py-1.5 rounded-full text-xs font-medium border border-blue-500/30 text-blue-400/80 hover:text-blue-300 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-200">
                                        📞 Schedule a call
                                    </button>
                                    <button onClick={startContactFlow} className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all duration-200">
                                        ✉️ Quick email
                                    </button>
                                    <button onClick={startSmsFlow} className="px-3 py-1.5 rounded-full text-xs font-medium border border-purple-500/30 text-purple-400/80 hover:text-purple-300 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-200">
                                        📱 Text me
                                    </button>
                                    <button onClick={handleAboutNash} className="px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all duration-200 flex items-center gap-1.5">
                                        <img src="/AI-NASH/nash-profile-img.jpg" alt="Nash" className="w-4 h-4 rounded-full object-cover" /> About Nash
                                    </button>
                                </div>
                            )}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2" style={{ animation: 'chatMsgFadeIn 0.3s ease-out' }}>
                                <div
                                    className="rounded-2xl px-4 py-3 flex items-center gap-2"
                                    style={{ background: "rgba(255, 255, 255, 0.07)" }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full bg-white/50"
                                            style={{ animation: "chatBounce 1.4s infinite ease-in-out" }}
                                        />
                                        <span
                                            className="w-1.5 h-1.5 rounded-full bg-white/50"
                                            style={{ animation: "chatBounce 1.4s infinite ease-in-out 0.2s" }}
                                        />
                                        <span
                                            className="w-1.5 h-1.5 rounded-full bg-white/50"
                                            style={{ animation: "chatBounce 1.4s infinite ease-in-out 0.4s" }}
                                        />
                                    </div>
                                    <span className="text-white/30 text-[10px] ml-1">Nash is thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* About Nash Overlay */}
                    {showAboutNash && (
                        <div
                            className="absolute inset-0 z-50 flex flex-col rounded-2xl overflow-hidden"
                            style={{
                                background: "rgba(6, 6, 10, 0.97)",
                                backdropFilter: "blur(30px)",
                                animation: "aboutNashFadeIn 0.3s ease-out both",
                            }}
                        >
                            {/* Overlay header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ">
                                        <video className="w-full h-full object-cover" src="/AI-NASH/NASH-VIDEO-AVATAR.mp4?v=3" autoPlay loop muted playsInline />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold text-sm">About Nash</div>
                                        <div className="text-amber-400/60 text-[10px]">AI-Powered Features</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAboutNash(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-200"
                                    aria-label="Close about Nash"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Scrollable feature list */}
                            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3" data-lenis-prevent>
                                {/* Intro */}
                                <p className="text-white/60 text-xs leading-relaxed">
                                    Nash is Mikey&apos;s AI assistant built into this site. Here&apos;s everything I can do for you:
                                </p>

                                {/* Feature cards */}
                                {[
                                    {
                                        icon: "💬",
                                        title: "Chat & Ask Questions",
                                        description: "Ask me anything about Michael's work, skills, experience, and services. I have in-depth knowledge of his entire portfolio.",
                                    },
                                    {
                                        icon: "🎯",
                                        title: "Smart Project Recommendations",
                                        description: "Describe your project or industry, and I'll recommend the most relevant work from Michael's portfolio that matches your needs.",
                                    },
                                    {
                                        icon: "📞",
                                        title: "Schedule a Call",
                                        description: "Book a strategy call with Michael directly through me. I'll walk you through picking a date, time, and collecting the details. Cancel anytime.",
                                    },
                                    {
                                        icon: "✉️",
                                        title: "Quick Email",
                                        description: "Send Michael a project inquiry email right from the chat — including your budget, timeline, and start date. Cancel anytime.",
                                    },
                                    {
                                        icon: "📱",
                                        title: "Text Michael",
                                        description: "Need a quick response? Send a text message directly to Michael through the chat. Cancel anytime.",
                                    },
                                    {
                                        icon: "🎙️",
                                        title: "Voice Input",
                                        description: "Tap the microphone to speak your message. Uses speech recognition to convert your voice to text — perfect for hands-free interaction.",
                                    },
                                    {
                                        icon: "🔊",
                                        title: "Voice Output",
                                        description: "Enable the speaker to hear Nash read responses aloud using AI-powered text-to-speech. Great for multitasking or accessibility.",
                                    },
                                    {
                                        icon: "⚡",
                                        title: "Real-Time Streaming",
                                        description: "Responses stream in word-by-word with smart scroll — the view stays pinned to the top of the message so you can read naturally.",
                                    },
                                    {
                                        icon: "🧠",
                                        title: "Visitor Memory",
                                        description: "I remember returning visitors so you don't have to re-enter your info every time you reach out.",
                                    },
                                    {
                                        icon: "🛡️",
                                        title: "Smart Guardrails",
                                        description: "I stay focused on Michael's work and services. I won't write code, essays, or go off-topic — I'm here to help you learn about Michael.",
                                    },
                                ].map((feature, i) => (
                                    <div
                                        key={feature.title}
                                        className="group rounded-xl px-3.5 py-3 transition-all duration-300 hover:bg-white/[0.04]"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.02)",
                                            border: "1px solid rgba(255, 255, 255, 0.04)",
                                            animation: `aboutNashFeatureIn 0.35s ease-out ${i * 0.05}s both`,
                                        }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className="text-base mt-0.5 flex-shrink-0">{feature.icon}</span>
                                            <div>
                                                <div className="text-white text-xs font-semibold mb-0.5">{feature.title}</div>
                                                <div className="text-white/45 text-[11px] leading-relaxed">{feature.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Footer CTA */}
                                <div className="pt-2 text-center">
                                    <button
                                        onClick={() => setShowAboutNash(false)}
                                        className="px-5 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-400/50 hover:text-amber-200 transition-all duration-300"
                                    >
                                        Got it — let&apos;s chat!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 px-4 pb-3 pr-16"
                        style={{ boxShadow: '#0f0c2a -20px -1px 10px', ...(isMobile ? { paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))" } : {}) }}
                    >
                        {/* Flow cancel button — appears when any flow is active */}
                        {(contactStep !== "idle" && contactStep !== "sent") || (scheduleStep !== "idle" && scheduleStep !== "sent") || (smsStep !== "idle" && smsStep !== "sent") ? (
                            <div className="flex items-center justify-between mb-2 px-1">
                                {/* Contact flow progress dots */}
                                {contactStep !== "idle" && contactStep !== "sent" ? (
                                    <FlowProgressDots
                                        steps={["name", "email", "budget", "timeline", "startDate", "confirm"]}
                                        currentStep={contactStep}
                                        color="emerald"
                                    />
                                ) : scheduleStep !== "idle" && scheduleStep !== "sent" ? (
                                    <FlowProgressDots
                                        steps={["name", "email", "budget", "date", "time", "confirm"]}
                                        currentStep={scheduleStep === "dateCustom" ? "date" : scheduleStep === "returning" ? "name" : scheduleStep}
                                        color="blue"
                                    />
                                ) : (
                                    <span className="text-[10px] text-white/30">📱 Texting...</span>
                                )}
                                {/* Cancel X button */}
                                <button
                                    type="button"
                                    onClick={cancelFlow}
                                    className="ml-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70 transition-all duration-200 flex-shrink-0"
                                    aria-label="Cancel flow"
                                    title="Cancel"
                                >
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : null}
                        <div
                            className={`flex items-center gap-2 rounded-full h-12 pl-4 pr-1 border transition-[border-color] duration-200 hover:border-white/[0.16] ${input.trim() ? 'border-white/[0.16]' : 'border-white/[0.06]'}`}
                        >
                            <input
                                ref={inputRef}
                                type="search"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : getPlaceholder()}
                                className={`flex-1 bg-transparent text-sm placeholder:text-white/30 outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${isListening ? "text-cyan-300 placeholder:text-cyan-400/50" : "text-white"}`}
                                disabled={isLoading || isListening}
                                id="chat-input"
                                name="chat-search"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-lpignore="true"
                                data-1p-ignore="true"
                                data-bwignore="true"
                                data-form-type="other"
                                data-protonpass-ignore="true"
                                role="presentation"
                            />
                            {/* Mic button */}
                            <button
                                type="button"
                                onClick={toggleMic}
                                disabled={isLoading}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${isListening
                                    ? "text-red-400 bg-red-500/15"
                                    : "text-white/30 bg-white/[0.06] hover:text-white/60 hover:bg-white/[0.1]"
                                    }`}
                                aria-label={isListening ? "Stop listening" : "Start voice input"}
                                title={isListening ? "Tap to stop" : "Speak to Nash"}
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={isListening ? { animation: "micPulse 1s ease-in-out infinite" } : undefined}
                                >
                                    <rect x="9" y="1" width="6" height="11" rx="3" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            </button>
                            <button
                                type="submit"
                                disabled={(!input.trim() && !isLoading) || isLoading}
                                className="relative flex items-center justify-center gap-1.5 h-10 px-4 rounded-full transition-all duration-300 flex-shrink-0 overflow-hidden"
                                style={{
                                    background: input.trim()
                                        ? 'linear-gradient(135deg, #544fd4 0%, #5673fa 40%, #6262bf 70%, #544fd4 100%)'
                                        : 'rgba(84, 79, 212, 0.15)',
                                    backgroundSize: input.trim() ? '300% 300%' : '100% 100%',
                                    animation: input.trim() ? 'sendBtnGradient 4s ease infinite' : 'none',
                                    boxShadow: input.trim() ? '0 0 16px rgba(86, 115, 250, 0.5)' : 'none',
                                }}
                                aria-label="Send message"
                                id="chat-send"
                            >
                                {isLoading ? (
                                    <img
                                        src="/Icon/MESSAGE-THINKING-ICON.svg"
                                        alt="Thinking"
                                        width={20}
                                        height={20}
                                        style={{ animation: 'brainPulse 1.8s ease-in-out infinite' }}
                                    />
                                ) : (
                                    <>
                                        <span className={`text-xs font-semibold transition-all duration-200 ${input.trim() ? 'text-white' : 'text-white/40'}`}>Send</span>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`transition-all duration-200 ${input.trim() ? 'text-white' : 'text-white/40'}`}
                                        >
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
