"use client";

import React, { useEffect, useState } from "react";

export function StatusBadge() {
    const [timeParams, setTimeParams] = useState<{
        timeString: string;
        isActive: boolean;
    } | null>(null);
    const [weather, setWeather] = useState<{
        temp: number;
        quote: string;
    } | null>(null);

    const getQuote = (temp: number) => {
        const ranges = [
            { max: 20, quotes: ["Freezing cold, my CPU loves it.", "Sub-zero hero.", "Chicago style: deep dish and frostbite.", "Actually too cold to function.", "Hibernation mode: ACTIVATED."] },
            { max: 32, quotes: ["Snow boots required.", "Winter is coming... oh wait, it's here.", "Ice ice baby.", "Frosty air, sharp mind.", "Checking logs by the fireplace."] },
            { max: 45, quotes: ["Chilly, but logic is crisp.", "Sweater weather engaged.", "Coffee is mandatory today.", "Cool breeze, clean code.", "Nature's air conditioning."] },
            { max: 55, quotes: ["Zip-up hoodie season.", "Brisk and productive.", "Perfect for some focused deep work.", "Not too hot, not too cold.", "Fresh air, fresh ideas."] },
            { max: 65, quotes: ["Actually pleasant outside?", "Spring vibes loading...", "Light jacket, heavy commit history.", "Sun's out, bugs (in code) out.", "Optimal operating temperature."] },
            { max: 75, quotes: ["Absolutely perfect weather.", "Patio coding session?", "Golden hour all day.", "Chicago showing off today.", "Vitamin D levels rising."] },
            { max: 85, quotes: ["Warm and sunny.", "Summer mode.", "Don't forget the sunscreen.", "Hot code, cool temper.", "Beautiful day to build something."] },
            { max: 95, quotes: ["It's heating up!", "Server room is the place to be.", "Hydration check.", "Melting point approaching.", "Spicy weather outside."] },
            { max: 120, quotes: ["Literally on fire.", "Too hot. Send ice cream.", "Code is fluid, like my brain.", "Error 404: Cold air not found.", "Why is it this hot?"] }
        ];

        const range = ranges.find(r => temp < r.max) || ranges[ranges.length - 1];
        return range.quotes[Math.floor(Math.random() * range.quotes.length)];
    };

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current_weather=true&temperature_unit=fahrenheit"
                );
                const data = await response.json();
                const temp = data.current_weather.temperature;
                setWeather({
                    temp: Math.round(temp),
                    quote: getQuote(temp),
                });
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            }
        };

        const updateTime = () => {
            const chicagoString = new Date().toLocaleString("en-US", {
                timeZone: "America/Chicago",
            });
            const chicagoDate = new Date(chicagoString);

            const hours = chicagoDate.getHours();
            const minutes = chicagoDate.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            const starTime = 8 * 60 + 30; // 8:30 AM
            const endTime = 17 * 60; // 5:00 PM

            const isActive = totalMinutes >= starTime && totalMinutes < endTime;

            let displayHours = hours % 12;
            displayHours = displayHours ? displayHours : 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHoursStr = displayHours.toString().padStart(2, "0");

            const timeString = `${displayHoursStr}:${displayMinutes} ${ampm}`;

            setTimeParams({ timeString, isActive });
        };

        updateTime();
        fetchWeather();

        const timeInterval = setInterval(updateTime, 10000);
        const weatherInterval = setInterval(fetchWeather, 300000); // Update weather every 5 mins

        return () => {
            clearInterval(timeInterval);
            clearInterval(weatherInterval);
        };
    }, []);

    if (!timeParams) return null;

    return (
        <div className="flex items-center gap-3 bg-white py-2 px-[11px] md:px-4 shadow-xl rounded-[20px]">
            <div className="relative flex items-center justify-center w-3 h-3">
                <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${timeParams.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                ></span>
                <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${timeParams.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                ></span>
            </div>
            <div className="flex flex-row items-center gap-2 md:gap-3 leading-none">
                <span className="text-[10px] tracking-[0.05em] font-bold text-zinc-900 tabular-nums uppercase whitespace-nowrap">
                    CHICAGO {timeParams.timeString}
                </span>
                {weather && (
                    <>
                        <span className="hidden min-[1001px]:block text-zinc-300">/</span>
                        <span className="text-[10px] tracking-[0.05em] font-bold text-zinc-900 tabular-nums uppercase whitespace-nowrap">
                            {weather.temp}°F
                        </span>
                        <span className="hidden min-[1001px]:block text-zinc-300">/</span>
                        <span className="hidden min-[1001px]:block text-[10px] md:text-xs tracking-tight md:tracking-[0.05em] font-medium text-zinc-500 italic whitespace-nowrap">
                            "{weather.quote}"
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
