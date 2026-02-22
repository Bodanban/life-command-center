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
      </div>
    </WidgetPanel>
  );
}
