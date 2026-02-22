'use client';

import { useEffect } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonButton from '@/components/ui/NeonButton';
import { usePomodoroStore } from '@/stores/usePomodoroStore';

export default function PomodoroWidget() {
  const {
    timeRemaining,
    totalTime,
    isRunning,
    sessionType,
    completedSessions,
    startedAt,
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
  } = usePomodoroStore();

  // Tick every second
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Calculate displayed time (account for real-time elapsed)
  let displayRemaining = timeRemaining;
  if (isRunning && startedAt) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    displayRemaining = Math.max(0, timeRemaining - elapsed);
  }

  const minutes = Math.floor(displayRemaining / 60).toString().padStart(2, '0');
  const seconds = (displayRemaining % 60).toString().padStart(2, '0');

  const progress = totalTime > 0 ? ((totalTime - displayRemaining) / totalTime) * 100 : 0;

  // SVG circle params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  const sessionLabels = {
    work: 'TRAVAIL',
    break: 'PAUSE',
    long_break: 'LONGUE PAUSE',
  };

  const sessionColors = {
    work: { stroke: '#00d4ff', text: 'text-cyber-blue', glow: 'text-glow-blue', accent: 'blue' as const },
    break: { stroke: '#00ff88', text: 'text-cyber-green', glow: 'text-glow-green', accent: 'green' as const },
    long_break: { stroke: '#b400ff', text: 'text-cyber-purple', glow: 'text-glow-purple', accent: 'purple' as const },
  };

  const colors = sessionColors[sessionType];

  // Force re-render every second when running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      usePomodoroStore.setState({});
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <WidgetPanel accent={colors.accent} title="Pomodoro" icon="⏱" className="h-full">
      <div className="flex flex-col items-center justify-center h-full gap-3">
        {/* Session type label */}
        <span className={`font-display text-[10px] uppercase tracking-[0.3em] ${colors.text}`}>
          {sessionLabels[sessionType]}
        </span>

        {/* Timer circle */}
        <div className="relative">
          <svg width="170" height="170" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: `drop-shadow(0 0 6px ${colors.stroke}40)`,
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-3xl font-bold ${colors.text} ${colors.glow}`}>
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <NeonButton
              variant={colors.accent === 'blue' ? 'blue' : colors.accent === 'green' ? 'green' : 'purple'}
              size="sm"
              onClick={startedAt ? resume : start}
            >
              {startedAt ? '▶ Reprendre' : '▶ Start'}
            </NeonButton>
          ) : (
            <NeonButton variant="ghost" size="sm" onClick={pause}>
              ⏸ Pause
            </NeonButton>
          )}
          <NeonButton variant="ghost" size="sm" onClick={reset}>
            ↺
          </NeonButton>
          <NeonButton variant="ghost" size="sm" onClick={skip}>
            ⏭
          </NeonButton>
        </div>

        {/* Session counter */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i < completedSessions % 4
                  ? 'bg-cyber-green shadow-neon-green'
                  : 'bg-white/10'
              }`}
            />
          ))}
          <span className="ml-2 font-mono text-[10px] text-cyber-text-dim">
            {completedSessions} sessions
          </span>
        </div>
      </div>
    </WidgetPanel>
  );
}
