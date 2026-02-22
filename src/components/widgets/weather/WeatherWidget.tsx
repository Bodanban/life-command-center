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

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        setWeather(data);
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Every 30 min
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
              Configurer OPENWEATHERMAP_API_KEY
            </p>
          </div>
        ) : (
          <>
            {/* Temperature + icon */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {weatherEmojis[weather.icon] || '🌤️'}
              </span>
              <span className="font-display text-3xl font-bold text-cyber-yellow text-glow-blue">
                {Math.round(weather.temp)}°
              </span>
            </div>

            {/* Description */}
            <p className="font-mono text-xs text-cyber-text capitalize">
              {weather.description}
            </p>

            {/* Details */}
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-mono text-cyber-text-dim">
                💧 {weather.humidity}%
              </span>
              <span className="text-[10px] font-mono text-cyber-text-dim">
                💨 {weather.wind} km/h
              </span>
            </div>

            {/* City */}
            <p className="font-display text-[9px] uppercase tracking-[0.3em] text-cyber-text-dim/50">
              {weather.city}
            </p>
          </>
        )}
      </div>
    </WidgetPanel>
  );
}
