"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { QUICK_REPLIES } from "@/lib/knowledge-base";
import { GradientBackground } from "./GradientBackground";

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
    const toggleRef = useRef<HTMLButtonElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Track mobile breakpoint
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
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
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
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
    }, []);

    const addUserMessage = useCallback((content: string) => {
        const msg: Message = {
            id: Date.now().toString() + Math.random(),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, msg]);
    }, []);

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
                            "Great, welcome back! 🎉\n\nWhat's your budget range for this project? (e.g. $5k-10k, $10k-25k, or just a rough idea)"
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
                        "Thanks! What's your budget range for this project? (e.g. $5k-10k, $10k-25k, or just a rough idea)"
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
                        const res = await fetch("/api/chat/contact", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(contactData),
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
                        addBotMessage("**What's your budget range?**\n\n• Under $5k\n• $5k–$10k\n• $10k–$25k\n• $25k–$50k\n• $50k+");
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
                    addBotMessage("**What's your budget range?**\n\n• Under $5k\n• $5k–$10k\n• $10k–$25k\n• $25k–$50k\n• $50k+");
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
                        const res = await fetch("/api/schedule", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(scheduleData),
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

                // Create a placeholder assistant message for streaming
                const assistantId = (Date.now() + 1).toString();
                const assistantMessage: Message = {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setIsLoading(false);

                // Stream the response
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

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
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === assistantId
                                                ? { ...m, content: m.content + parsed.text }
                                                : m
                                        )
                                    );
                                }
                            } catch {
                                // skip malformed chunks
                            }
                        }
                    }
                }

                // Check for [UNKNOWN] marker — Nash didn't know the answer
                setMessages((prev) => {
                    const assistantMsg = prev.find((m) => m.id === assistantId);
                    if (assistantMsg?.content.includes("[UNKNOWN]")) {
                        // Send the unanswered question to Michael via ntfy + email
                        fetch("/api/unknown-question", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ question: input, type: "unknown" }),
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
                            body: JSON.stringify({ question: input, type: "feature_request" }),
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
                return "e.g. $5k-10k, $10k+...";
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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 overflow-hidden ${isOpen ? '' : 'hover:scale-110 active:scale-95'} ${isMobile && isOpen ? 'bottom-3 right-[6px]' : 'bottom-7 right-[30px]'}`}
                style={{
                    border: isOpen ? '1px solid rgba(255, 255, 255, 0.06)' : '7px solid #0150fe',
                    transition: 'border-color 0.4s, transform 0.3s',
                    boxShadow: "rgba(1, 90, 255, 0) 0px 0px 0px 3px, rgba(0, 0, 0, 0.4) 0px 8px 32px",
                }}
                aria-label={isOpen ? "Close chat" : "Open chat"}
                id="chat-toggle"
                ref={toggleRef}
            >
                {/* Nash video — always present, never unmounts */}
                <video
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
            </button>

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
                    bottom: "0px",
                    right: "0px",
                    width: isMobile ? "100vw" : "min(400px, calc(100vw - 24px))",
                    height: isMobile ? "100dvh" : "min(620px, calc(100vh - 24px))",
                    paddingBottom: isMobile ? "0px" : "20px",
                    paddingRight: isMobile ? "0px" : "24px",
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
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 z-0 pointer-events-none opacity-85 overflow-hidden ${isMobile ? "" : "rounded-2xl"}`}>
                        <GradientBackground />
                        {/* Subtle drifting blobs for gentle morphing effect */}
                        <div className="absolute w-[200px] h-[200px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(1, 80, 254, 0.5) 0%, transparent 70%)", top: "10%", left: "20%", animation: "chatBlobDrift1 22s ease-in-out infinite alternate" }} />
                        <div className="absolute w-[180px] h-[180px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(100, 50, 255, 0.4) 0%, transparent 70%)", bottom: "20%", right: "10%", animation: "chatBlobDrift2 26s ease-in-out infinite alternate" }} />
                        <div className="absolute w-[150px] h-[150px] rounded-full opacity-28" style={{ background: "radial-gradient(circle, rgba(0, 200, 255, 0.35) 0%, transparent 70%)", top: "50%", left: "40%", animation: "chatBlobDrift3 30s ease-in-out infinite alternate" }} />
                        <div className="absolute w-[220px] h-[220px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(1, 50, 200, 0.4) 0%, transparent 70%)", bottom: "40%", left: "-5%", animation: "chatBlobDrift4 24s ease-in-out infinite alternate" }} />
                        <div className="absolute w-[160px] h-[160px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(80, 0, 255, 0.35) 0%, transparent 70%)", top: "60%", left: "15%", animation: "chatBlobDrift5 28s ease-in-out infinite alternate" }} />
                    </div>
                    {/* Header */}
                    <div className="relative z-10 flex items-center gap-3 px-4 py-3" >
                        <video className="w-10 h-10 rounded-full object-contain bg-[#0150fe]" src="/AI-NASH/NASH-VIDEO-AVATAR.mp4?v=3" autoPlay loop muted playsInline />
                        <div className="flex-1">
                            <div className="text-white font-semibold text-sm">Nash</div>
                            <div className="text-white/40 text-[10px]">AI Assistant</div>
                        </div>
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

                    {/* Messages */}
                    <div
                        ref={chatBodyRef}
                        data-lenis-prevent
                        className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-3"
                        style={{ scrollBehavior: "smooth", overscrollBehavior: "contain" }}
                    >
                        {/* Welcome message - always visible */}
                        <div className="space-y-4">
                            <div>
                                <div
                                    className={`rounded-2xl px-4 py-3 ${fontSizeClass} text-white/90 leading-relaxed max-w-[85%]`}
                                    style={{ background: "rgba(255, 255, 255, 0.07)", boxShadow: "0 2px 12px rgba(0, 0, 0, 0.25)" }}
                                >
                                    Hi, I&apos;m Nash — Mikey&apos;s AI partner. I can tell you
                                    about his work, skills, services, or help you get in touch.
                                    What would you like to know?
                                </div>
                                <div className="text-[11px] text-white/30 mt-1 ml-1">Nash</div>
                            </div>

                            {/* Quick Replies - always visible */}
                            <div className="flex flex-wrap gap-2">
                                {QUICK_REPLIES.map((qr) => (
                                    <button
                                        key={qr.label}
                                        onClick={() => handleQuickReply(qr.message)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 text-white/70 hover:text-white hover:border-[#0158ff]/50 hover:bg-[#0158ff]/10 transition-all duration-200"
                                    >
                                        {qr.label}
                                    </button>
                                ))}
                                {/* Send a message button */}
                                <button
                                    onClick={startContactFlow}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all duration-200"
                                >
                                    ✉️ Quick email
                                </button>
                                {/* Text me button */}
                                <button
                                    onClick={startSmsFlow}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-blue-500/30 text-blue-400/80 hover:text-blue-300 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-200"
                                >
                                    📱 Text me
                                </button>
                                {/* About Nash button */}
                                <button
                                    onClick={handleAboutNash}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all duration-200 flex items-center gap-1.5"
                                >
                                    <img src="/AI-NASH/nash-profile-img.jpg" alt="Nash" className="w-4 h-4 rounded-full object-cover" /> About Nash
                                </button>
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
                                    className={`${msg.role === "user" ? "flex flex-col items-end" : ""}`}
                                    style={{
                                        animation: `${msg.role === "assistant" ? "msgSlideInLeft" : "msgSlideInRight"} 0.3s ease-out both`,
                                    }}
                                >
                                    <div
                                        className={`relative rounded-2xl px-3 py-2 ${fontSizeClass} leading-relaxed max-w-[85%] ${msg.role === "user"
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
                                    </div>
                                    <div className={`text-[11px] text-white/30 mt-1 ${msg.role === "user" ? "mr-1 text-right" : "ml-1"}`}>
                                        {msg.role === "user" ? "You" : "Nash"}
                                    </div>
                                </div>
                                {/* Delivered indicator & timestamp for user messages */}
                                {msg.role === "user" && (
                                    <div
                                        className="flex justify-end mt-0.5"
                                        style={{ animation: "deliveredFade 0.8s ease-out both" }}
                                    >
                                        <span className="text-[9px] text-white/30 flex items-center gap-1">
                                            ✓ Delivered
                                        </span>
                                    </div>
                                )}
                                {/* Just now timestamp for latest message */}
                                {idx === messages.length - 1 && msg.role === "assistant" && (
                                    <div className="mt-0.5">
                                        <span className="text-[9px] text-white/25">just now</span>
                                    </div>
                                )}
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
                                    <button
                                        onClick={startScheduleFlow}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-blue-500/30 text-blue-400/80 hover:text-blue-300 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-200"
                                    >
                                        📞 Schedule a call
                                    </button>
                                    <button
                                        onClick={startContactFlow}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all duration-200"
                                    >
                                        ✉️ Quick email
                                    </button>
                                    <button
                                        onClick={startSmsFlow}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-purple-500/30 text-purple-400/80 hover:text-purple-300 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-200"
                                    >
                                        📱 Text me
                                    </button>
                                    <button
                                        onClick={handleAboutNash}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all duration-200 flex items-center gap-1.5"
                                    >
                                        <img src="/AI-NASH/nash-profile-img.jpg" alt="Nash" className="w-4 h-4 rounded-full object-cover" /> About Nash
                                    </button>
                                </div>
                            )}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div>
                                <div
                                    className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                                    style={{ background: "rgba(255, 255, 255, 0.07)" }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full bg-white/40"
                                        style={{ animation: "chatBounce 1.4s infinite ease-in-out" }}
                                    />
                                    <span
                                        className="w-2 h-2 rounded-full bg-white/40"
                                        style={{
                                            animation: "chatBounce 1.4s infinite ease-in-out 0.2s",
                                        }}
                                    />
                                    <span
                                        className="w-2 h-2 rounded-full bg-white/40"
                                        style={{
                                            animation: "chatBounce 1.4s infinite ease-in-out 0.4s",
                                        }}
                                    />
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
                                        description: "Book a strategy call with Michael directly through me. I'll walk you through picking a date, time, and collecting the details.",
                                    },
                                    {
                                        icon: "✉️",
                                        title: "Quick Email",
                                        description: "Send Michael a project inquiry email right from the chat — including your budget, timeline, and start date.",
                                    },
                                    {
                                        icon: "📱",
                                        title: "Text Michael",
                                        description: "Need a quick response? Send a text message directly to Michael through the chat.",
                                    },
                                    {
                                        icon: "🧠",
                                        title: "Visitor Memory",
                                        description: "I remember returning visitors so you don't have to re-enter your info every time you reach out.",
                                    },
                                    {
                                        icon: "⚡",
                                        title: "Real-Time Streaming",
                                        description: "Responses stream in word-by-word for a fast, natural conversation experience — no waiting for full replies.",
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

                    {/* Blur fade between messages and input */}


                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="relative z-10 px-4 py-3 pr-16"
                        style={isMobile ? { paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))" } : undefined}
                    >
                        {/* Contact flow progress indicator */}
                        {contactStep !== "idle" && contactStep !== "sent" && (
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                {["name", "email", "budget", "timeline", "startDate", "confirm"].map((step, i) => (
                                    <React.Fragment key={step}>
                                        <div
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${["name", "email", "budget", "timeline", "startDate", "confirm"].indexOf(
                                                contactStep
                                            ) >= i
                                                ? "bg-emerald-400 scale-100"
                                                : "bg-white/15 scale-75"
                                                }`}
                                        />
                                        {i < 5 && (
                                            <div
                                                className={`flex-1 h-[1px] transition-all duration-300 ${["name", "email", "budget", "timeline", "startDate", "confirm"].indexOf(
                                                    contactStep
                                                ) > i
                                                    ? "bg-emerald-400/50"
                                                    : "bg-white/10"
                                                    }`}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                                <span className="ml-2 text-[10px] text-white/30">
                                    {contactStep === "name" ? "1/6"
                                        : contactStep === "email" ? "2/6"
                                            : contactStep === "budget" ? "3/6"
                                                : contactStep === "timeline" ? "4/6"
                                                    : contactStep === "startDate" ? "5/6"
                                                        : "6/6"}
                                </span>
                            </div>
                        )}
                        <div
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                            style={{ background: "rgba(255, 255, 255, 0)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                        >
                            <input
                                ref={inputRef}
                                type="search"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={getPlaceholder()}
                                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                                disabled={isLoading}
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
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="text-white/40 hover:text-white disabled:opacity-30 disabled:hover:text-white/40 transition-colors p-1"
                                aria-label="Send message"
                                id="chat-send"
                            >
                                <img
                                    src="/Icon/MESSAGE-THINKING-ICON.svg"
                                    alt="Send"
                                    width={20}
                                    height={20}
                                    style={input.trim() ? { animation: 'pulse 2.5s ease-in-out infinite' } : undefined}
                                />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
