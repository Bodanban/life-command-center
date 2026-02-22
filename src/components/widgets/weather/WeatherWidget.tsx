'use client';

import { useEffect, useState } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  wind: number;
}

const weatherEmojis: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '';
const CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Paris';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      setError(true);
      return;
    }

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=fr`
        );
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        setWeather({
          temp: data.main.temp,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed * 3.6),
        });
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetPanel accent="yellow" title="Meteo" icon="🌤" className="h-full">
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {error || !weather ? (
          <div className="text-center">
            <span className="text-3xl">🌐</span>
            <p className="text-cyber-text-dim/50 text-xs font-mono mt-2">
              {error ? 'API non configuree' : 'Chargement...'}
            </p>
            <p className="text-cyber-text-dim/30 text-[10px] font-mono mt-1">
              Ajouter NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {weatherEmojis[weather.icon] || '🌤️'}
              </span>
              <span className="font-display text-3xl font-bold text-cyber-yellow text-glow-blue">
                {Math.round(weather.temp)}°
              </span>
            </div>
            <p className="font-mono text-xs text-cyber-text capitalize">
              {weather.description}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-mono text-cyber-text-dim">
                💧 {weather.humidity}%
              </span>
              <span className="text-[10px] font-mono text-cyber-text-dim">
                💨 {weather.wind} km/h
              </span>
            </div>
            <p className="font-display text-[9px] uppercase tracking-[0.3em] text-cyber-text-dim/50">
              {weather.city}
            </p>
          </>
        )}
      </div>
    </WidgetPanel>
  );
}
