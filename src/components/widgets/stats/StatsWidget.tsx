'use client';

import { useEffect, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { useTaskStore } from '@/stores/useTaskStore';
import { usePomodoroStore } from '@/stores/usePomodoroStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useObjectiveStore } from '@/stores/useObjectiveStore';
import {
  useDailyScoreStore,
  calculateGlobalScore,
} from '@/stores/useDailyScoreStore';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function StatsWidget() {
  const tasks = useTaskStore((s) => s.tasks);
  const completedSessions = usePomodoroStore((s) => s.completedSessions);
  const habits = useHabitStore((s) => s.habits);
  const isCompletedOnDate = useHabitStore((s) => s.isCompletedOnDate);
  const objectives = useObjectiveStore((s) => s.objectives);

  const saveScore = useDailyScoreStore((s) => s.saveScore);
  const getScores = useDailyScoreStore((s) => s.getScores);
  const getStreak = useDailyScoreStore((s) => s.getStreak);
  const getAverageScore = useDailyScoreStore((s) => s.getAverageScore);
  const getTrend = useDailyScoreStore((s) => s.getTrend);

  const today = todayString();

  // Calculate today's scores
  const todayScores = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.is_completed).length;
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter((o) => o.is_completed).length;
    const objectiveScore =
      totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

    const activeHabits = habits.filter((h) => h.is_active);
    const completedHabits = activeHabits.filter((h) =>
      isCompletedOnDate(h.id, today)
    ).length;
    const habitScore =
      activeHabits.length > 0
        ? Math.round((completedHabits / activeHabits.length) * 100)
        : 0;

    const globalScore = calculateGlobalScore(
      habitScore,
      objectiveScore,
      taskScore,
      completedSessions
    );

    return {
      habitScore,
      objectiveScore,
      taskScore,
      pomodoroSessions: completedSessions,
      globalScore,
      completedHabits,
      totalHabits: activeHabits.length,
      completedTasks,
      totalTasks,
      completedObjectives,
      totalObjectives,
    };
  }, [tasks, objectives, habits, completedSessions, isCompletedOnDate, today]);

  // Save score every time it changes
  useEffect(() => {
    saveScore({
      date: today,
      habitScore: todayScores.habitScore,
      objectiveScore: todayScores.objectiveScore,
      taskScore: todayScores.taskScore,
      pomodoroSessions: todayScores.pomodoroSessions,
      globalScore: todayScores.globalScore,
    });
  }, [today, todayScores, saveScore]);

  const last14 = getScores(14);
  const streak = getStreak();
  const avg7 = getAverageScore(7);
  const trend = getTrend();

  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor =
    trend === 'up'
      ? 'text-cyber-green'
      : trend === 'down'
      ? 'text-cyber-red'
      : 'text-cyber-yellow';

  const scoreColor =
    todayScores.globalScore >= 80
      ? '#00ff88'
      : todayScores.globalScore >= 50
      ? '#ffd700'
      : '#ff0040';

  // SVG circle for score gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (todayScores.globalScore / 100) * circumference;

  return (
    <WidgetPanel
      accent="blue"
      title="Score du Jour"
      icon="📊"
      className="h-full"
    >
      <div className="flex h-full gap-3">
        {/* Left: Score gauge + breakdown */}
        <div className="flex flex-col items-center gap-2 w-[130px] flex-shrink-0">
          {/* Circular score */}
          <div className="relative">
            <svg width="100" height="100" className="-rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={scoreColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                  filter: `drop-shadow(0 0 8px ${scoreColor}50)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-display text-2xl font-bold"
                style={{ color: scoreColor, textShadow: `0 0 10px ${scoreColor}60` }}
              >
                {todayScores.globalScore}
              </span>
              <span className="font-mono text-[8px] text-cyber-text-dim/60 uppercase">
                /100
              </span>
            </div>
          </div>

          {/* Breakdown mini-bars */}
          <div className="w-full space-y-1">
            <ScoreBar label="Habitudes" value={todayScores.habitScore} color="#b400ff" detail={`${todayScores.completedHabits}/${todayScores.totalHabits}`} />
            <ScoreBar label="Objectifs" value={todayScores.objectiveScore} color="#00ff88" detail={`${todayScores.completedObjectives}/${todayScores.totalObjectives}`} />
            <ScoreBar label="Tâches" value={todayScores.taskScore} color="#00d4ff" detail={`${todayScores.completedTasks}/${todayScores.totalTasks}`} />
            <ScoreBar label="Pomodoro" value={Math.min(100, (todayScores.pomodoroSessions / 8) * 100)} color="#ffd700" detail={`${todayScores.pomodoroSessions}/8`} />
          </div>
        </div>

        {/* Right: Chart + metrics */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Top metrics row */}
          <div className="flex gap-2">
            <MetricBox
              label="Streak"
              value={`${streak}j`}
              icon="🔥"
              color={streak > 0 ? '#ff6ec7' : '#666'}
            />
            <MetricBox
              label="Moy. 7j"
              value={`${avg7}`}
              icon="📈"
              color={avg7 >= 70 ? '#00ff88' : avg7 >= 40 ? '#ffd700' : '#ff0040'}
            />
            <MetricBox
              label="Trend"
              value={trendIcon}
              icon=""
              color={trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff0040' : '#ffd700'}
              className={trendColor}
            />
          </div>

          {/* 14-day chart */}
          <div className="flex-1 flex flex-col">
            <span className="font-mono text-[8px] text-cyber-text-dim/50 uppercase tracking-wider mb-1">
              14 derniers jours
            </span>
            <div className="flex-1 flex items-end gap-[3px]">
              {last14.map((score, i) => {
                const height = Math.max(2, (score.globalScore / 100) * 100);
                const isToday = score.date === today;
                const barColor =
                  score.globalScore >= 80
                    ? '#00ff88'
                    : score.globalScore >= 50
                    ? '#ffd700'
                    : score.globalScore > 0
                    ? '#ff0040'
                    : 'rgba(255,255,255,0.06)';

                const d = new Date(score.date + 'T00:00:00');
                const dayLabel = ['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()];

                return (
                  <div
                    key={score.date}
                    className="flex-1 flex flex-col items-center gap-0.5"
                  >
                    {/* Score value on hover area */}
                    <div className="relative group flex-1 w-full flex items-end">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          isToday ? 'animate-pulse-neon' : ''
                        }`}
                        style={{
                          height: `${height}%`,
                          backgroundColor: barColor + (isToday ? '' : '80'),
                          boxShadow:
                            score.globalScore > 0
                              ? `0 0 4px ${barColor}40`
                              : 'none',
                          border: isToday
                            ? `1px solid ${barColor}`
                            : 'none',
                        }}
                      />
                      {/* Tooltip */}
                      {score.globalScore > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                          <div className="bg-cyber-bg-deep/95 border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-cyber-text whitespace-nowrap">
                            {score.globalScore}%
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[7px] font-mono ${
                        isToday
                          ? 'text-cyber-blue font-bold'
                          : 'text-cyber-text-dim/30'
                      }`}
                    >
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scale labels */}
            <div className="flex justify-between mt-0.5">
              <span className="text-[7px] font-mono text-cyber-text-dim/20">0</span>
              <span className="text-[7px] font-mono text-cyber-text-dim/20">50</span>
              <span className="text-[7px] font-mono text-cyber-text-dim/20">100</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetPanel>
  );
}

function ScoreBar({
  label,
  value,
  color,
  detail,
}: {
  label: string;
  value: number;
  color: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[8px] text-cyber-text-dim/60 w-[50px] truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.round(value)}%`,
            backgroundColor: color + '90',
            boxShadow: value > 0 ? `0 0 4px ${color}40` : 'none',
          }}
        />
      </div>
      <span className="font-mono text-[8px] text-cyber-text-dim/50 w-[24px] text-right">
        {detail}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
  color,
  className = '',
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  className?: string;
}) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-lg p-1.5 flex flex-col items-center border border-white/[0.05]">
      <div className="flex items-center gap-1">
        {icon && <span className="text-[10px]">{icon}</span>}
        <span
          className={`font-display text-sm font-bold ${className}`}
          style={!className ? { color, textShadow: `0 0 6px ${color}40` } : undefined}
        >
          {value}
        </span>
      </div>
      <span className="font-mono text-[7px] text-cyber-text-dim/40 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
