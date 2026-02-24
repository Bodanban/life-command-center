'use client';

import { useEffect, useState, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonButton from '@/components/ui/NeonButton';
import { usePomodoroStore } from '@/stores/usePomodoroStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useDailyScoreStore } from '@/stores/useDailyScoreStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

function CyberTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cyber-bg-deep/95 border border-cyber-blue/30 rounded-lg px-3 py-2 shadow-neon-blue">
      <p className="font-mono text-[9px] text-cyber-text-dim mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-[10px] font-bold" style={{ color: entry.color }}>
          {entry.name}: {Math.round(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ===================== COMPACT VIEW =====================
function CompactPomodoro() {
  const {
    timeRemaining, totalTime, isRunning, sessionType, completedSessions, startedAt,
    currentTaskId, start, pause, resume, reset, skip, tick, linkTask, unlinkTask,
  } = usePomodoroStore();

  const tasks = useTaskStore((s) => s.tasks);
  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const linkedTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null;

  useEffect(() => {
    if (currentTaskId && !tasks.find((t) => t.id === currentTaskId)) unlinkTask();
  }, [currentTaskId, tasks, unlinkTask]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  let displayRemaining = timeRemaining;
  if (isRunning && startedAt) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    displayRemaining = Math.max(0, timeRemaining - elapsed);
  }

  const minutes = Math.floor(displayRemaining / 60).toString().padStart(2, '0');
  const seconds = (displayRemaining % 60).toString().padStart(2, '0');
  const progress = totalTime > 0 ? ((totalTime - displayRemaining) / totalTime) * 100 : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  const sessionLabels = { work: 'TRAVAIL', break: 'PAUSE', long_break: 'LONGUE PAUSE' };
  const sessionColors = {
    work: { stroke: '#00d4ff', text: 'text-cyber-blue', glow: 'text-glow-blue', accent: 'blue' as const },
    break: { stroke: '#00ff88', text: 'text-cyber-green', glow: 'text-glow-green', accent: 'green' as const },
    long_break: { stroke: '#b400ff', text: 'text-cyber-purple', glow: 'text-glow-purple', accent: 'purple' as const },
  };

  const colors = sessionColors[sessionType];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <span className={`font-display text-[10px] uppercase tracking-[0.3em] ${colors.text}`}>
        {sessionLabels[sessionType]}
      </span>

      <div className="h-5 flex items-center">
        {linkedTask ? (
          <div className="flex items-center gap-1.5 max-w-[200px]">
            <span className="font-mono text-[9px] text-cyber-yellow truncate">
              📎 {linkedTask.title}
            </span>
            <button onClick={unlinkTask} className="text-[9px] text-cyber-text-dim/40 hover:text-cyber-red transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
              ✕
            </button>
          </div>
        ) : incompleteTasks.length > 0 ? (
          <select
            onChange={(e) => { if (e.target.value) linkTask(e.target.value); }}
            value=""
            className="bg-transparent border border-white/10 rounded px-2 py-0.5 font-mono text-[9px] text-cyber-text-dim/60 outline-none max-w-[180px] cursor-pointer min-h-[44px]"
          >
            <option value="" className="bg-cyber-bg-deep">Lier une tache...</option>
            {incompleteTasks.map((t) => (
              <option key={t.id} value={t.id} className="bg-cyber-bg-deep">{t.title}</option>
            ))}
          </select>
        ) : (
          <span className="font-mono text-[9px] text-cyber-text-dim/30">Aucune tache</span>
        )}
      </div>

      <div className="relative">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="80" cy="80" r={radius} fill="none" stroke={colors.stroke} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${colors.stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-bold ${colors.text} ${colors.glow}`}>
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isRunning ? (
          <NeonButton
            variant={colors.accent === 'blue' ? 'blue' : colors.accent === 'green' ? 'green' : 'purple'}
            size="sm" onClick={startedAt ? resume : start}
          >
            {startedAt ? '▶ Reprendre' : '▶ Start'}
          </NeonButton>
        ) : (
          <NeonButton variant="ghost" size="sm" onClick={pause}>⏸ Pause</NeonButton>
        )}
        <NeonButton variant="ghost" size="sm" onClick={reset}>↺</NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={skip}>⏭</NeonButton>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < completedSessions % 4 ? 'bg-cyber-green shadow-neon-green' : 'bg-white/10'
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-[10px] text-cyber-text-dim">
          {completedSessions} sessions
        </span>
      </div>
    </div>
  );
}

// ===================== EXPANDED VIEW =====================
function ExpandedPomodoro() {
  const completedSessions = usePomodoroStore((s) => s.completedSessions);
  const taskSessions = usePomodoroStore((s) => s.taskSessions) || {};
  const tasks = useTaskStore((s) => s.tasks);
  const getScores = useDailyScoreStore((s) => s.getScores);

  const last14 = getScores(14);

  // Top tasks by pomodoro sessions
  const topTasks = useMemo(() => {
    return Object.entries(taskSessions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([taskId, count]) => {
        const task = tasks.find((t) => t.id === taskId);
        return { title: task?.title || 'Tache supprimee', count };
      });
  }, [taskSessions, tasks]);

  const chartData = last14.map((s) => {
    const d = new Date(s.date + 'T00:00:00');
    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return {
      name: dayLabels[d.getDay()],
      sessions: s.pomodoroSessions,
      fill: s.pomodoroSessions >= 8 ? '#00ff88' : s.pomodoroSessions >= 4 ? '#ffd700' : s.pomodoroSessions > 0 ? '#ff0040' : 'rgba(255,255,255,0.06)',
    };
  });

  const weekTotal = chartData.slice(-7).reduce((sum, d) => sum + d.sessions, 0);
  const todayMinutes = completedSessions * 25;

  // Find peak hour (rough estimate based on data)
  const peakHour = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '6h-8h';
    if (hour < 18) return '14h-16h';
    return '20h-22h';
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Metrics */}
      <div className="flex gap-3">
        <MetricBox label="Aujourd'hui" value={`${completedSessions}`} sub={`${todayMinutes}min`} color="#ffd700" />
        <MetricBox label="Semaine" value={`${weekTotal}`} sub={`${weekTotal * 25}min`} color="#00d4ff" />
        <MetricBox label="Objectif" value="8/j" sub="200min" color="#00ff88" />
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chart */}
        <div className="flex-1 flex flex-col">
          <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mb-2">
            Sessions par jour (14j)
          </p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#7a7a9e' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#7a7a9e' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CyberTooltip />} />
                <ReferenceLine y={8} stroke="#00ff88" strokeDasharray="5 5" strokeOpacity={0.3} />
                <Bar dataKey="sessions" radius={[3, 3, 0, 0]} name="Sessions" isAnimationActive={false}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top tasks + insight */}
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-3">
          {topTasks.length > 0 && (
            <div>
              <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mb-2">
                Top taches (par sessions)
              </p>
              <div className="space-y-1.5">
                {topTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="font-display text-sm font-bold text-cyber-yellow w-6 text-center">{t.count}</span>
                    <span className="font-mono text-[10px] text-cyber-text truncate flex-1">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-sm">💡</span>
            <p className="font-mono text-[10px] text-cyber-text-dim/70 mt-1 leading-relaxed">
              Pic de focus estime : <span className="text-cyber-blue font-bold">{peakHour}</span>.
              Reserve le travail creatif pour cette fenetre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-lg p-3 flex flex-col items-center border border-white/[0.05]">
      <span className="font-display text-xl font-bold" style={{ color, textShadow: `0 0 8px ${color}40` }}>{value}</span>
      <span className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">{label}</span>
      <span className="font-mono text-[8px] text-cyber-text-dim/30">{sub}</span>
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function PomodoroWidget() {
  return (
    <WidgetPanel accent="blue" title="Pomodoro" icon="⏱" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedPomodoro /> : <CompactPomodoro />
      }
    </WidgetPanel>
  );
}
