import { useState, useEffect } from 'react';

// Simple in-memory cache
let weatherCache: { temp: number; quote: string } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useWeather() {
    const [weather, setWeather] = useState<{ temp: number; quote: string } | null>(weatherCache);

    useEffect(() => {
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

        const fetchWeather = async () => {
            const now = Date.now();

            // Return cached data if valid
            if (weatherCache && (now - lastFetchTime < CACHE_DURATION)) {
                setWeather(weatherCache);
                return;
            }

            try {
                const response = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current_weather=true&temperature_unit=fahrenheit"
                );
                const data = await response.json();
                const temp = data.current_weather.temperature;
                const newWeather = {
                    temp: Math.round(temp),
                    quote: getQuote(temp),
                };

                weatherCache = newWeather;
                lastFetchTime = now;
                setWeather(newWeather);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            }
        };

        fetchWeather();

        // Refresh periodically (every 5 mins)
        const interval = setInterval(fetchWeather, CACHE_DURATION);
        return () => clearInterval(interval);
    }, []);

    return weather;
}
