"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useModal } from '../context/ModalContext';

const BUDGET_OPTIONS = [
    { label: 'Select budget range...', value: '' },
    { label: 'Under $5,000', value: '<$5k' },
    { label: '$5,000 – $15,000', value: '$5k-$15k' },
    { label: '$15,000+', value: '$15k+' },
];

const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM',
];

interface FormData {
    name: string;
    email: string;
    budget: string;
    date: string;
    time: string;
    description: string;
}

const initialFormData: FormData = {
    name: '',
    email: '',
    budget: '',
    date: '',
    time: '',
    description: '',
};

export function ScheduleModal() {
    const { isModalOpen, closeModal } = useModal();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            if (isSuccess) {
                setTimeout(() => {
                    setIsSuccess(false);
                    setFormData(initialFormData);
                    setError(null);
                }, 500);
            }
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isModalOpen, isSuccess]);

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    // Calculate form completion progress
    const formProgress = (() => {
        const fields = [
            formData.name,
            formData.email,
            formData.budget,
            formData.date,
            formData.time,
        ];
        const filled = fields.filter(f => f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
    })();

    // Scrub video based on form progress
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (formProgress === 100) {
            // Play and loop when complete
            video.loop = true;
            video.play().catch(() => { });
        } else {
            // Scrub to position based on progress
            video.pause();
            video.loop = false;
            const duration = video.duration || 4;
            video.currentTime = (formProgress / 100) * duration;
        }
    }, [formProgress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name || !formData.email || !formData.date || !formData.time) {
            setError('Please fill in all required fields.');
            return;
        }

        // Prevent double submission
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit booking');
            }

            // Show Success State
            setIsSuccess(true);

            // Close modal after delay
            setTimeout(() => {
                closeModal();
            }, 5000);

        } catch (err) {
            console.error('Booking error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0  backdrop-blur-sm transition-opacity duration-300"
                onClick={closeModal}
            />

            {/* Modal Card */}
            <div className="relative w-full h-screen flex flex-col bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Gradient Border Top */}

                <button
                    onClick={closeModal}
                    className="absolute top-8 right-8 z-20 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="p-6 md:p-8 relative z-10 flex-1 min-h-0 overflow-y-auto">

                    {!isSuccess ? (
                        <>
                            <div className="flex justify-start md:justify-end mb-4 mt-[30px]">
                                <div className="relative w-48 h-28 rounded-lg overflow-hidden bg-white/5">
                                    {/* Video scrubs with progress */}
                                    <video
                                        ref={videoRef}
                                        src="/gif/form.mp4"
                                        muted
                                        playsInline
                                        preload="auto"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Dark overlay that recedes with progress */}
                                    <div
                                        className="absolute inset-0 bg-black/70 transition-opacity duration-500 ease-out"
                                        style={{ opacity: formProgress < 100 ? 1 - (formProgress / 200) : 0 }}
                                    />
                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                        <div
                                            className="h-full bg-[#0158ff] transition-all duration-500 ease-out"
                                            style={{ width: `${formProgress}%` }}
                                        />
                                    </div>
                                    {/* Progress percentage */}
                                    {formProgress < 100 && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm font-medium">
                                            {formProgress}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                Book a  <span className="text-[#0158ff] underline">Strategy Call</span>
                            </h2>
                            <p className="text-zinc-400 mb-6 text-sm">
                                We’ll identify automation gaps, UX friction, and growth opportunities in 30 minutes.                            </p>

                            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {/* Row: Name + Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            type="text"
                                            id="booking-name"
                                            name="name"
                                            required
                                            className={`w-full px-3 py-2 bg-white/5 rounded-lg text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all ${formData.name ? 'text-white' : 'text-zinc-600'}`}
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            id="booking-email"
                                            name="email"
                                            required
                                            className={`w-full px-3 py-2 bg-white/5 rounded-lg text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all ${formData.email ? 'text-white' : 'text-zinc-600'}`}
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Budget - Full Width */}
                                <div>
                                    <select
                                        id="booking-budget"
                                        name="budget"
                                        className={`w-full px-3 py-2 bg-white/5 rounded-lg text-sm focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all appearance-none cursor-pointer [color-scheme:dark] ${formData.budget ? 'text-white' : 'text-zinc-600'}`}
                                        value={formData.budget}
                                        onChange={handleChange}
                                    >
                                        {BUDGET_OPTIONS.map((opt, idx) => (
                                            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                                                {idx === 0 ? 'Project Budget' : opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row: Date + Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="min-w-0">
                                        <input
                                            type="text"
                                            id="booking-date"
                                            name="date"
                                            required
                                            min={getMinDate()}
                                            placeholder="Preferred Date"
                                            onFocus={(e) => (e.target.type = 'date')}
                                            onBlur={(e) => {
                                                if (!e.target.value) e.target.type = 'text';
                                            }}
                                            onClick={(e) => {
                                                e.currentTarget.type = 'date';
                                                e.currentTarget.showPicker();
                                            }}
                                            className={`w-full min-w-0 px-3 py-2 bg-white/5 rounded-lg text-sm focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all [color-scheme:dark] cursor-pointer placeholder:text-zinc-600 ${formData.date ? 'text-white' : 'text-zinc-600'}`}
                                            value={formData.date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <select
                                            id="booking-time"
                                            name="time"
                                            required
                                            className={`w-full px-3 py-2 bg-white/5 rounded-lg text-sm focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all appearance-none cursor-pointer [color-scheme:dark] ${formData.time ? 'text-white' : 'text-zinc-600'}`}
                                            value={formData.time}
                                            onChange={handleChange}
                                        >
                                            <option value="" className="bg-[#0a0a0a]">Preferred Time</option>
                                            {TIME_SLOTS.map(time => (
                                                <option key={time} value={time} className="bg-[#0a0a0a]">{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <textarea
                                        id="booking-description"
                                        name="description"
                                        rows={4}
                                        className={`w-full px-3 py-2 bg-white/5 rounded-lg text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#0158ff] focus:ring-1 focus:ring-[#0158ff]/50 transition-all resize-none ${formData.description ? 'text-white' : 'text-zinc-600'}`}
                                        placeholder="Project Context (Optional)"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-1 w-full py-3 bg-[#0158ff] hover:bg-[#0046cc] text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Booking...
                                        </>
                                    ) : (
                                        "Book Strategy Call"
                                    )}
                                </button>

                                <p className="text-[10px] text-zinc-600 text-center">
                                    All times are in Central Time (CT) — Chicago. I'll confirm your booking via email.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="py-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Strategy Call Booked! 🎉</h3>
                            <p className="text-zinc-400 mb-1 text-sm">
                                Thanks {formData.name.split(' ')[0]}! I've sent a confirmation to your email.
                            </p>
                            <p className="text-zinc-500 text-sm mt-2">
                                I look forward to chatting with you on {new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {formData.time}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ModalWrapper() {
    return <ScheduleModal />;
}
