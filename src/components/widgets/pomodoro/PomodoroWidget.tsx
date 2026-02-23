'use client';

import { useEffect } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonButton from '@/components/ui/NeonButton';
import { usePomodoroStore } from '@/stores/usePomodoroStore';
import { useTaskStore } from '@/stores/useTaskStore';

export default function PomodoroWidget() {
  const {
    timeRemaining,
    totalTime,
    isRunning,
    sessionType,
    completedSessions,
    startedAt,
    currentTaskId,
    start,
    pause,
    resume,
    reset,
    skip,
    tick,
    linkTask,
    unlinkTask,
  } = usePomodoroStore();

  const tasks = useTaskStore((s) => s.tasks);
  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const linkedTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null;

  // Auto-unlink if task was deleted
  useEffect(() => {
    if (currentTaskId && !tasks.find((t) => t.id === currentTaskId)) {
      unlinkTask();
    }
  }, [currentTaskId, tasks, unlinkTask]);

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
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {/* Session type label */}
        <span className={`font-display text-[10px] uppercase tracking-[0.3em] ${colors.text}`}>
          {sessionLabels[sessionType]}
        </span>

        {/* Linked task indicator */}
        <div className="h-5 flex items-center">
          {linkedTask ? (
            <div className="flex items-center gap-1.5 max-w-[200px]">
              <span className="font-mono text-[9px] text-cyber-yellow truncate">
                📎 {linkedTask.title}
              </span>
              <button
                onClick={unlinkTask}
                className="text-[9px] text-cyber-text-dim/40 hover:text-cyber-red transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ) : incompleteTasks.length > 0 ? (
            <select
              onChange={(e) => { if (e.target.value) linkTask(e.target.value); }}
              value=""
              className="bg-transparent border border-white/10 rounded px-2 py-0.5 font-mono text-[9px] text-cyber-text-dim/60 outline-none max-w-[180px] cursor-pointer"
            >
              <option value="" className="bg-cyber-bg-deep">Lier une tache...</option>
              {incompleteTasks.map((t) => (
                <option key={t.id} value={t.id} className="bg-cyber-bg-deep">
                  {t.title}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-mono text-[8px] text-cyber-text-dim/30">Aucune tache</span>
          )}
        </div>

        {/* Timer circle */}
        <div className="relative">
          <svg width="160" height="160" className="-rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            <circle
              cx="80"
              cy="80"
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
