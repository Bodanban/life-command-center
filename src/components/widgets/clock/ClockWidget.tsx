'use client';

import { useEffect, useState, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { getCurrentPhase } from '@/stores/useRoutineStore';

const TIMELINE_BLOCKS = [
  { start: 5, end: 7.5, label: 'Routine Matin', color: '#00ff88', icon: '🌅' },
  { start: 7.5, end: 17, label: 'Stage Hopital', color: '#00d4ff', icon: '🏥' },
  { start: 17, end: 21, label: 'Programme Hebdo', color: '#00d4ff', icon: '📅' },
  { start: 21, end: 23, label: 'Routine Soir', color: '#b400ff', icon: '🌙' },
  { start: 23, end: 24, label: 'Repos', color: '#666', icon: '😴' },
  { start: 0, end: 5, label: 'Sommeil', color: '#333', icon: '💤' },
];

// ===================== COMPACT VIEW =====================
function CompactClock() {
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

  const currentHour = time.getHours() + time.getMinutes() / 60;
  const dayProgress = Math.min(100, Math.max(0, ((currentHour - 5) / (23 - 5)) * 100));
  const progressColor = dayProgress < 50 ? '#00d4ff' : '#b400ff';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <div className="flex items-baseline gap-0.5 relative">
        <div className="absolute inset-0 -inset-x-8 -inset-y-4 rounded-full blur-2xl opacity-20"
          style={{ background: `radial-gradient(circle, #00d4ff, transparent)` }}
        />
        <span className="font-display text-5xl font-black relative"
          style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff, 0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)' }}
        >{hours}</span>
        <span className="font-display text-5xl font-black animate-pulse-neon relative"
          style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff, 0 0 30px rgba(0,212,255,0.4)' }}
        >:</span>
        <span className="font-display text-5xl font-black relative"
          style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff, 0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)' }}
        >{minutes}</span>
        <span className="font-display text-xl font-bold text-cyber-blue/50 ml-1 relative">{seconds}</span>
      </div>

      <div className="text-center">
        <p className="font-mono text-[11px] text-cyber-text-dim tracking-[0.3em]">
          {dayName} // {day} {month} {year}
        </p>
      </div>

      <div className="w-full px-1 mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[8px] text-cyber-text-dim/40">5h</span>
          <span className="font-mono text-[9px] font-bold" style={{ color: progressColor, textShadow: `0 0 4px ${progressColor}60` }}>
            {Math.round(dayProgress)}%
          </span>
          <span className="font-mono text-[8px] text-cyber-text-dim/40">23h</span>
        </div>
        <div className="relative h-[4px] bg-white/[0.06] rounded-full overflow-visible">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${dayProgress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #b400ff)',
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.4), 0 0 16px rgba(180, 0, 255, 0.2)',
            }}
          />
          <div
            className="absolute top-1/2 w-[9px] h-[9px] rounded-full animate-pulse-neon"
            style={{
              left: `${dayProgress}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              background: progressColor,
              boxShadow: `0 0 8px ${progressColor}, 0 0 20px ${progressColor}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ===================== EXPANDED TIMELINE =====================
function ExpandedClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = time.getHours() + time.getMinutes() / 60;
  const phase = getCurrentPhase(time.getHours());

  // Find next phase transition
  const nextTransition = useMemo(() => {
    if (currentHour < 5) return { label: 'Routine Matin', at: '05:00', minutes: Math.round((5 - currentHour) * 60) };
    if (currentHour < 7.5) return { label: 'Stage Hopital', at: '07:30', minutes: Math.round((7.5 - currentHour) * 60) };
    if (currentHour < 17) return { label: 'Programme Hebdo', at: '17:00', minutes: Math.round((17 - currentHour) * 60) };
    if (currentHour < 21) return { label: 'Routine Soir', at: '21:00', minutes: Math.round((21 - currentHour) * 60) };
    if (currentHour < 23) return { label: 'Repos', at: '23:00', minutes: Math.round((23 - currentHour) * 60) };
    return { label: 'Routine Matin', at: '05:00', minutes: Math.round((24 - currentHour + 5) * 60) };
  }, [currentHour]);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Big clock */}
      <div className="flex items-center gap-6">
        <div className="flex items-baseline">
          <span className="font-display text-6xl font-black" style={{ color: '#00d4ff', textShadow: '0 0 15px #00d4ff, 0 0 40px rgba(0,212,255,0.3)' }}>
            {hours}:{minutes}
          </span>
          <span className="font-display text-2xl font-bold text-cyber-blue/40 ml-2">{seconds}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-cyber-text-dim/60">Prochaine phase</span>
          <span className="font-display text-sm font-bold text-cyber-blue">{nextTransition.label}</span>
          <span className="font-mono text-[10px] text-cyber-text-dim/40">
            dans {nextTransition.minutes}min ({nextTransition.at})
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col gap-2">
        <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
          Timeline de la journee
        </p>

        <div className="flex-1 flex flex-col gap-1">
          {TIMELINE_BLOCKS.filter(b => !(b.start === 0 && b.end === 5)).map((block) => {
            // Calculate block width as percentage of 5h-24h range (19h)
            const rangeStart = Math.max(block.start, 5);
            const rangeEnd = block.end;
            const totalRange = 19; // 5h to 24h
            const widthPct = ((rangeEnd - rangeStart) / totalRange) * 100;
            const leftPct = ((rangeStart - 5) / totalRange) * 100;

            // Is current time in this block?
            const isActive = currentHour >= block.start && currentHour < block.end;
            // Progress within block
            const blockProgress = isActive
              ? Math.min(100, ((currentHour - block.start) / (block.end - block.start)) * 100)
              : currentHour >= block.end ? 100 : 0;

            return (
              <div key={block.label} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive ? 'bg-white/[0.06]' : blockProgress === 100 ? 'bg-white/[0.02] opacity-50' : 'bg-white/[0.02] opacity-40'
              }`}
                style={isActive ? { border: `1px solid ${block.color}40`, boxShadow: `0 0 10px ${block.color}15` } : { border: '1px solid transparent' }}
              >
                <span className="text-lg w-8 text-center">{block.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] font-bold ${isActive ? 'text-cyber-text' : 'text-cyber-text-dim/60'}`}>
                      {block.label}
                    </span>
                    <span className="font-mono text-[9px] text-cyber-text-dim/40 ml-auto">
                      {Math.floor(block.start)}h — {Math.floor(block.end)}h
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${blockProgress}%`,
                        backgroundColor: block.color,
                        boxShadow: isActive ? `0 0 4px ${block.color}40` : 'none',
                      }}
                    />
                  </div>
                </div>
                {isActive && (
                  <span className="font-display text-sm font-bold flex-shrink-0" style={{ color: block.color }}>
                    {Math.round(blockProgress)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function ClockWidget() {
  return (
    <WidgetPanel accent="blue" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedClock /> : <CompactClock />
      }
    </WidgetPanel>
  );
}
