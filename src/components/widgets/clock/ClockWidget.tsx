'use client';

import { useEffect, useState } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dayNames = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const monthNames = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];

  const dayName = dayNames[time.getDay()];
  const day = time.getDate().toString().padStart(2, '0');
  const month = monthNames[time.getMonth()];
  const year = time.getFullYear();

  // Day progress: 5h (0%) → 23h (100%)
  const currentHour = time.getHours() + time.getMinutes() / 60;
  const dayProgress = Math.min(100, Math.max(0, ((currentHour - 5) / (23 - 5)) * 100));

  return (
    <WidgetPanel accent="blue" className="h-full">
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {/* Time */}
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-cyber-blue text-glow-blue">
            {hours}
          </span>
          <span className="font-display text-4xl font-bold text-cyber-blue animate-pulse-neon">
            :
          </span>
          <span className="font-display text-4xl font-bold text-cyber-blue text-glow-blue">
            {minutes}
          </span>
          <span className="font-display text-lg font-bold text-cyber-blue/60 ml-1">
            {seconds}
          </span>
        </div>

        {/* Date */}
        <div className="text-center">
          <p className="font-mono text-xs text-cyber-text-dim tracking-[0.3em]">
            {dayName} // {day} {month} {year}
          </p>
        </div>

        {/* Day progress bar */}
        <div className="w-full px-1 mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[7px] text-cyber-text-dim/40">5h</span>
            <span className="font-mono text-[7px] text-cyber-text-dim/40">{Math.round(dayProgress)}%</span>
            <span className="font-mono text-[7px] text-cyber-text-dim/40">23h</span>
          </div>
          <div className="relative h-[3px] bg-white/[0.06] rounded-full overflow-visible">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${dayProgress}%`,
                background: 'linear-gradient(90deg, #00d4ff, #b400ff)',
                boxShadow: '0 0 6px rgba(0, 212, 255, 0.3)',
              }}
            />
            {/* Glowing dot at current position */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full"
              style={{
                left: `${dayProgress}%`,
                transform: `translateX(-50%) translateY(-50%)`,
                background: dayProgress < 50 ? '#00d4ff' : '#b400ff',
                boxShadow: `0 0 8px ${dayProgress < 50 ? '#00d4ff' : '#b400ff'}, 0 0 16px ${dayProgress < 50 ? '#00d4ff40' : '#b400ff40'}`,
              }}
            />
          </div>
        </div>
      </div>
    </WidgetPanel>
  );
}
