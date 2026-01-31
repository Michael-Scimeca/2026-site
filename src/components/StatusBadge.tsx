"use client";

import React, { useEffect, useState } from "react";
import { useWeather } from "@/hooks/useWeather";

export function StatusBadge() {
    const [timeParams, setTimeParams] = useState<{
        timeString: string;
        isActive: boolean;
    } | null>(null);

    const weather = useWeather();

    // Initial time calculation immediate on mount
    useEffect(() => {
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
        const timeInterval = setInterval(updateTime, 10000);
        return () => clearInterval(timeInterval);
    }, []);

    if (!timeParams || !weather) return null;

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
