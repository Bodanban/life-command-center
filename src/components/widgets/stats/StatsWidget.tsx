'use client';

import { useEffect, useMemo, useState } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { useTaskStore } from '@/stores/useTaskStore';
import { usePomodoroStore } from '@/stores/usePomodoroStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useObjectiveStore, getMorningQuestCount, getBedtimeQuestCount, getWeeklyQuestCount } from '@/stores/useObjectiveStore';
import {
  useDailyScoreStore,
  calculateGlobalScore,
} from '@/stores/useDailyScoreStore';
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateInsights, getInsightColor, type Insight } from '@/lib/utils/insights';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Cyberpunk chart theme
const CHART_COLORS = {
  cyan: '#00d4ff',
  purple: '#b400ff',
  green: '#00ff88',
  yellow: '#ffd700',
  red: '#ff0040',
  grid: 'rgba(255,255,255,0.05)',
  axis: 'rgba(255,255,255,0.1)',
  tick: '#7a7a9e',
};

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

export default function StatsWidget() {
  const tasks = useTaskStore((s) => s.tasks);
  const completedSessions = usePomodoroStore((s) => s.completedSessions);
  const taskSessions = usePomodoroStore((s) => s.taskSessions);
  const habits = useHabitStore((s) => s.habits);
  const isCompletedOnDate = useHabitStore((s) => s.isCompletedOnDate);
  const objectives = useObjectiveStore((s) => s.objectives);
  const isQuestCompleted = useObjectiveStore((s) => s.isQuestCompleted);

  // Compute routine rates from quest completions (using real active step counts)
  const morningRoutineRate = useMemo(() => {
    const { total, ids } = getMorningQuestCount();
    if (total === 0) return 100;
    const completed = ids.filter((id) => isQuestCompleted(id)).length;
    return Math.round((completed / total) * 100);
  }, [isQuestCompleted]);
  const bedtimeRoutineRate = useMemo(() => {
    const { total, ids } = getBedtimeQuestCount();
    if (total === 0) return 100;
    const completed = ids.filter((id) => isQuestCompleted(id)).length;
    return Math.round((completed / total) * 100);
  }, [isQuestCompleted]);
  const weeklyRoutineRate = useMemo(() => {
    const { total, ids } = getWeeklyQuestCount();
    if (total === 0) return 100;
    const completed = ids.filter((id) => isQuestCompleted(id)).length;
    return Math.round((completed / total) * 100);
  }, [isQuestCompleted]);

  // Combined routine rate (average of morning + weekly + bedtime)
  const routineRate = useMemo(() => {
    return Math.round((morningRoutineRate + weeklyRoutineRate + bedtimeRoutineRate) / 3);
  }, [morningRoutineRate, weeklyRoutineRate, bedtimeRoutineRate]);

  const saveScore = useDailyScoreStore((s) => s.saveScore);
  const getScores = useDailyScoreStore((s) => s.getScores);
  const getStreak = useDailyScoreStore((s) => s.getStreak);
  const getAverageScore = useDailyScoreStore((s) => s.getAverageScore);
  const getTrend = useDailyScoreStore((s) => s.getTrend);
  const getBestScore = useDailyScoreStore((s) => s.getBestScore);

  const today = todayString();

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

    const globalScore = calculateGlobalScore(habitScore, objectiveScore, taskScore, completedSessions, routineRate);

    return {
      habitScore, objectiveScore, taskScore,
      pomodoroSessions: completedSessions,
      globalScore, completedHabits,
      totalHabits: activeHabits.length,
      completedTasks, totalTasks,
      completedObjectives, totalObjectives,
      routineRate,
    };
  }, [tasks, objectives, habits, completedSessions, isCompletedOnDate, today, routineRate]);

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
  const last30 = getScores(30);
  const streak = getStreak();
  const avg7 = getAverageScore(7);
  const trend = getTrend();
  const bestScore = getBestScore();

  // Habit completions for last 7 days (for insights)
  const habitCompletions = useMemo(() => {
    const result: Record<string, number> = {};
    const activeHabits = habits.filter((h) => h.is_active);
    for (const habit of activeHabits) {
      let count = 0;
      const d = new Date();
      for (let i = 0; i < 7; i++) {
        const ds = d.toISOString().split('T')[0];
        if (isCompletedOnDate(habit.id, ds)) count++;
        d.setDate(d.getDate() - 1);
      }
      result[habit.id] = count;
    }
    return result;
  }, [habits, isCompletedOnDate]);

  // Generate insights
  const insights = useMemo(() => generateInsights({
    scores: last14,
    streak,
    trend,
    avgScore: avg7,
    bestScore,
    todayScore: todayScores.globalScore,
    habits,
    habitCompletions,
    totalTasks: todayScores.totalTasks,
    completedTasks: todayScores.completedTasks,
    totalObjectives: todayScores.totalObjectives,
    completedObjectives: todayScores.completedObjectives,
    pomodoroSessions: completedSessions,
    taskSessions: taskSessions || {},
    morningRoutineRate,
    bedtimeRoutineRate,
    weeklyRoutineRate,
  }), [last14, streak, trend, avg7, bestScore, todayScores, habits, habitCompletions, completedSessions, taskSessions, morningRoutineRate, bedtimeRoutineRate, weeklyRoutineRate]);

  const scoreColor =
    todayScores.globalScore >= 80 ? '#00ff88'
    : todayScores.globalScore >= 50 ? '#ffd700'
    : '#ff0040';

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (todayScores.globalScore / 100) * circumference;

  // Recharts data
  const chartData14 = last14.map((s) => {
    const d = new Date(s.date + 'T00:00:00');
    const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return {
      name: dayLabels[d.getDay()],
      score: s.globalScore,
      fill: s.globalScore >= 80 ? CHART_COLORS.green : s.globalScore >= 50 ? CHART_COLORS.yellow : s.globalScore > 0 ? CHART_COLORS.red : 'rgba(255,255,255,0.06)',
    };
  });

  const chartData30 = last30.map((s) => {
    const d = new Date(s.date + 'T00:00:00');
    return {
      name: `${d.getDate()}/${d.getMonth() + 1}`,
      score: s.globalScore,
      habits: s.habitScore,
      objectives: s.objectiveScore,
      tasks: s.taskScore,
      pomodoro: Math.min(100, (s.pomodoroSessions / 8) * 100),
    };
  });

  const pomodoroChartData = last14.map((s) => {
    const d = new Date(s.date + 'T00:00:00');
    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return {
      name: dayLabels[d.getDay()],
      sessions: s.pomodoroSessions,
      fill: s.pomodoroSessions >= 8 ? CHART_COLORS.green : s.pomodoroSessions >= 4 ? CHART_COLORS.yellow : s.pomodoroSessions > 0 ? CHART_COLORS.red : 'rgba(255,255,255,0.06)',
    };
  });

  return (
    <WidgetPanel accent="blue" title="Score du Jour" icon="📊" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? (
          <ExpandedDashboard
            chartData30={chartData30}
            pomodoroChartData={pomodoroChartData}
            insights={insights}
            streak={streak}
            avg7={avg7}
            trend={trend}
            todayScore={todayScores.globalScore}
            completedSessions={completedSessions}
            taskSessions={taskSessions || {}}
            tasks={tasks}
          />
        ) : (
          <CompactView
            todayScores={todayScores}
            scoreColor={scoreColor}
            radius={radius}
            circumference={circumference}
            dashOffset={dashOffset}
            streak={streak}
            avg7={avg7}
            trend={trend}
            chartData14={chartData14}
            insights={insights}
          />
        )
      }
    </WidgetPanel>
  );
}

// ===================== COMPACT VIEW (normal grid) =====================
function CompactView({
  todayScores,
  scoreColor,
  radius,
  circumference,
  dashOffset,
  streak,
  avg7,
  trend,
  chartData14,
  insights,
}: {
  todayScores: {
    globalScore: number;
    habitScore: number;
    objectiveScore: number;
    taskScore: number;
    pomodoroSessions: number;
    completedHabits: number;
    totalHabits: number;
    completedTasks: number;
    totalTasks: number;
    completedObjectives: number;
    totalObjectives: number;
    routineRate: number;
  };
  scoreColor: string;
  radius: number;
  circumference: number;
  dashOffset: number;
  streak: number;
  avg7: number;
  trend: 'up' | 'down' | 'stable';
  chartData14: Array<{ name: string; score: number; fill: string }>;
  insights: Insight[];
}) {
  const trendIcon = trend === 'up' ? '\u2197' : trend === 'down' ? '\u2198' : '\u2192';

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex flex-1 gap-3">
        {/* Left: Score gauge + breakdown */}
        <div className="flex flex-col items-center gap-2 w-[120px] flex-shrink-0">
          <div className="relative">
            <svg width="96" height="96" className="-rotate-90">
              <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="48" cy="48" r={radius} fill="none" stroke={scoreColor}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${scoreColor}50)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-xl font-bold" style={{ color: scoreColor, textShadow: `0 0 10px ${scoreColor}60` }}>
                {todayScores.globalScore}
              </span>
              <span className="font-mono text-[7px] text-cyber-text-dim/60 uppercase">/100</span>
            </div>
          </div>
          <div className="w-full space-y-1">
            <ScoreBar label="Routines" value={todayScores.routineRate} color="#00ff88" detail={`${todayScores.routineRate}%`} />
            <ScoreBar label="Habitudes" value={todayScores.habitScore} color="#b400ff" detail={`${todayScores.completedHabits}/${todayScores.totalHabits}`} />
            <ScoreBar label="Objectifs" value={todayScores.objectiveScore} color="#00d4ff" detail={`${todayScores.completedObjectives}/${todayScores.totalObjectives}`} />
            <ScoreBar label="Taches" value={todayScores.taskScore} color="#ffd700" detail={`${todayScores.completedTasks}/${todayScores.totalTasks}`} />
            <ScoreBar label="Pomodoro" value={Math.min(100, (todayScores.pomodoroSessions / 8) * 100)} color="#ff6ec7" detail={`${todayScores.pomodoroSessions}/8`} />
          </div>
        </div>

        {/* Right: Chart + metrics */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex gap-2">
            <MetricBox label="Streak" value={`${streak}j`} icon="🔥" color={streak > 0 ? '#ff6ec7' : '#666'} />
            <MetricBox label="Moy. 7j" value={`${avg7}`} icon="📈" color={avg7 >= 70 ? '#00ff88' : avg7 >= 40 ? '#ffd700' : '#ff0040'} />
            <MetricBox label="Trend" value={trendIcon} icon="" color={trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff0040' : '#ffd700'} />
          </div>

          {/* Recharts 14-day bar chart */}
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData14} margin={{ top: 2, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 7, fill: CHART_COLORS.tick }} axisLine={{ stroke: CHART_COLORS.axis }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 7, fill: CHART_COLORS.tick }} axisLine={false} tickLine={false} />
                <Tooltip content={<CyberTooltip />} />
                <Bar dataKey="score" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {chartData14.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight of the day */}
      {insights.length > 0 && (
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <span className="text-xs">{insights[0].icon}</span>
          <span className="font-mono text-[9px] truncate" style={{ color: getInsightColor(insights[0].color) }}>
            {insights[0].message}
          </span>
        </div>
      )}
    </div>
  );
}

// ===================== EXPANDED DASHBOARD (fullscreen) =====================
type TabType = 'score' | 'pomodoro' | 'insights';

function ExpandedDashboard({
  chartData30,
  pomodoroChartData,
  insights,
  streak,
  avg7,
  trend,
  todayScore,
  completedSessions,
  taskSessions,
  tasks,
}: {
  chartData30: Array<{ name: string; score: number; habits: number; objectives: number; tasks: number; pomodoro: number }>;
  pomodoroChartData: Array<{ name: string; sessions: number; fill: string }>;
  insights: Insight[];
  streak: number;
  avg7: number;
  trend: 'up' | 'down' | 'stable';
  todayScore: number;
  completedSessions: number;
  taskSessions: Record<string, number>;
  tasks: Array<{ id: string; title: string; is_completed: boolean }>;
}) {
  const [tab, setTab] = useState<TabType>('score');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'score', label: 'Score', icon: '📊' },
    { id: 'pomodoro', label: 'Pomodoro', icon: '⏱' },
    { id: 'insights', label: 'Insights', icon: '🧠' },
  ];

  // Top 3 tasks by pomodoro sessions
  const topTasks = Object.entries(taskSessions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([taskId, count]) => {
      const task = tasks.find((t) => t.id === taskId);
      return { title: task?.title || 'Tache supprimee', count };
    });

  const weekTotal = pomodoroChartData.slice(-7).reduce((sum, d) => sum + d.sessions, 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tab bar */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              tab === t.id
                ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 shadow-neon-blue'
                : 'text-cyber-text-dim hover:text-cyber-text border border-transparent hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}

        {/* Summary metrics */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-center">
            <span className="font-display text-lg font-bold text-cyber-blue">{todayScore}</span>
            <span className="font-mono text-[8px] text-cyber-text-dim/50 block uppercase">Score</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-bold" style={{ color: streak > 0 ? '#ff6ec7' : '#666' }}>
              {streak}j
            </span>
            <span className="font-mono text-[8px] text-cyber-text-dim/50 block uppercase">Streak</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-bold" style={{ color: avg7 >= 70 ? '#00ff88' : '#ffd700' }}>
              {avg7}
            </span>
            <span className="font-mono text-[8px] text-cyber-text-dim/50 block uppercase">Moy 7j</span>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === 'score' && (
          <div className="h-full">
            <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mb-2">
              Evolution sur 30 jours
            </p>
            <div className="h-[calc(100%-20px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData30} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: CHART_COLORS.tick }} axisLine={{ stroke: CHART_COLORS.axis }} tickLine={false} interval={2} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: CHART_COLORS.tick }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CyberTooltip />} />
                  <ReferenceLine y={70} stroke="#ff6ec7" strokeDasharray="5 5" strokeOpacity={0.4} label={{ value: '70%', position: 'right', fontSize: 8, fill: '#ff6ec7' }} />
                  <Line type="monotone" dataKey="score" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} name="Score" filter="drop-shadow(0 0 4px #00d4ff40)" />
                  <Line type="monotone" dataKey="habits" stroke={CHART_COLORS.purple} strokeWidth={1} dot={false} name="Habitudes" strokeOpacity={0.6} />
                  <Line type="monotone" dataKey="objectives" stroke={CHART_COLORS.green} strokeWidth={1} dot={false} name="Objectifs" strokeOpacity={0.6} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'pomodoro' && (
          <div className="h-full flex flex-col gap-4">
            <div className="flex gap-4">
              <MetricBoxLarge label="Sessions Aujourd'hui" value={`${completedSessions}`} color={CHART_COLORS.yellow} />
              <MetricBoxLarge label="Total Semaine" value={`${weekTotal}`} color={CHART_COLORS.cyan} />
              <MetricBoxLarge label="Trend" value={trend === 'up' ? '\u2197 Hausse' : trend === 'down' ? '\u2198 Baisse' : '\u2192 Stable'} color={trend === 'up' ? CHART_COLORS.green : trend === 'down' ? CHART_COLORS.red : CHART_COLORS.yellow} />
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
              {/* Chart */}
              <div className="flex-1">
                <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mb-2">
                  Sessions par jour (14j)
                </p>
                <div className="h-[calc(100%-20px)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pomodoroChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: CHART_COLORS.tick }} axisLine={{ stroke: CHART_COLORS.axis }} tickLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: CHART_COLORS.tick }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CyberTooltip />} />
                      <ReferenceLine y={8} stroke={CHART_COLORS.green} strokeDasharray="5 5" strokeOpacity={0.3} />
                      <Bar dataKey="sessions" radius={[3, 3, 0, 0]} name="Sessions" isAnimationActive={false}>
                        {pomodoroChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top tasks */}
              {topTasks.length > 0 && (
                <div className="w-[200px] flex-shrink-0">
                  <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mb-2">
                    Top taches (par sessions)
                  </p>
                  <div className="space-y-2">
                    {topTasks.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <span className="font-display text-sm font-bold text-cyber-yellow">{t.count}</span>
                        <span className="font-mono text-[10px] text-cyber-text truncate flex-1">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'insights' && (
          <div className="h-full overflow-y-auto space-y-2">
            {insights.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="font-mono text-sm text-cyber-text-dim/40">
                  Pas assez de donnees pour generer des insights. Continue a utiliser le dashboard !
                </p>
              </div>
            ) : (
              insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{insight.icon}</span>
                  <p className="font-mono text-sm leading-relaxed" style={{ color: getInsightColor(insight.color) }}>
                    {insight.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== SHARED COMPONENTS =====================
function ScoreBar({ label, value, color, detail }: { label: string; value: number; color: string; detail: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[8px] text-cyber-text-dim/60 w-[50px] truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.round(value)}%`, backgroundColor: color + '90', boxShadow: value > 0 ? `0 0 4px ${color}40` : 'none' }}
        />
      </div>
      <span className="font-mono text-[8px] text-cyber-text-dim/50 w-[24px] text-right">{detail}</span>
    </div>
  );
}

function MetricBox({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-lg p-1.5 flex flex-col items-center border border-white/[0.05]">
      <div className="flex items-center gap-1">
        {icon && <span className="text-[10px]">{icon}</span>}
        <span className="font-display text-sm font-bold" style={{ color, textShadow: `0 0 6px ${color}40` }}>{value}</span>
      </div>
      <span className="font-mono text-[7px] text-cyber-text-dim/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function MetricBoxLarge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-lg p-3 flex flex-col items-center border border-white/[0.05]">
      <span className="font-display text-xl font-bold" style={{ color, textShadow: `0 0 8px ${color}40` }}>{value}</span>
      <span className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}
