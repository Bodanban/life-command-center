'use client';

import { useEffect, useState, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { useRoutineStore, getCurrentPhase, getWeeklyTasksForToday, getDayOfWeek } from '@/stores/useRoutineStore';
import { useObjectiveStore } from '@/stores/useObjectiveStore';
import { useRoutineTrackerStore } from '@/stores/useRoutineTrackerStore';
import type { DailyRoutineSnapshot } from '@/stores/useRoutineTrackerStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

const DAY_MESSAGES: Record<number, string> = {
  1: 'Nouvelle semaine, nouvelles victoires',
  2: 'Consecration et focus total',
  3: 'Mi-semaine, double d\'effort',
  4: 'La discipline fait la difference',
  5: 'Finis la semaine en force',
  6: 'Investis en toi-meme',
  7: 'Gratitude et repos actif',
};

const DAY_NAMES: Record<number, string> = {
  1: 'LUN', 2: 'MAR', 3: 'MER', 4: 'JEU', 5: 'VEN', 6: 'SAM', 7: 'DIM',
};

const PHASE_CONFIG = {
  morning: { icon: '🌅', label: 'ROUTINE MATIN', color: '#00ff88', accent: 'green' as const },
  weekly: { icon: '📅', label: 'PROGRAMME HEBDO', color: '#00d4ff', accent: 'blue' as const },
  bedtime: { icon: '🌙', label: 'ROUTINE SOIR', color: '#b400ff', accent: 'purple' as const },
  off: { icon: '😴', label: 'REPOS', color: '#666', accent: 'blue' as const },
};

// ===================== STEP ROW =====================
function StepRow({
  name, detail, icon, done, color, onToggle,
}: {
  name: string; detail?: string; icon?: string; done: boolean; color: string; onToggle: () => void;
}) {
  const genericDetails = new Set(['-', name, 'Eau', 'Hygiene', 'Priere', 'Tenue', 'Lecture', 'Bilan + plan demain']);
  const showDetail = detail && !genericDetails.has(detail);

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all touch-manipulation min-h-[44px] ${
        done ? 'opacity-40' : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
      }`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center text-[10px] transition-all ${
          done ? 'bg-cyber-green/20 border-cyber-green/50 text-cyber-green' : 'border-white/20'
        }`}
        style={done ? { boxShadow: `0 0 3px ${color}30` } : undefined}
      >
        {done ? '✓' : ''}
      </span>
      {icon && <span className="text-sm flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={`font-mono text-[10px] leading-tight truncate ${
          done ? 'line-through text-cyber-text-dim/40' : 'text-cyber-text'
        }`}>
          {name}
        </p>
        {showDetail && (
          <p className="font-mono text-[8px] truncate" style={{ color: done ? 'rgba(255,255,255,0.12)' : color + '70' }}>
            {detail}
          </p>
        )}
      </div>
    </button>
  );
}

// ===================== COMPACT VIEW (phase-based) =====================
function CompactRoutine() {
  const { getActiveStepsForToday } = useRoutineStore();
  const { toggleQuest, isQuestCompleted } = useObjectiveStore();
  const [hour, setHour] = useState(new Date().getHours());
  const saveSnapshot = useRoutineTrackerStore((s) => s.saveSnapshot);

  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  const day = useMemo(() => getDayOfWeek(), []);
  const dayName = DAY_NAMES[day];
  const dayMessage = DAY_MESSAGES[day];
  const phase = getCurrentPhase(hour);
  const config = PHASE_CONFIG[phase];

  // Morning steps
  const morningSteps = getActiveStepsForToday('morning').map(({ step, detail }, i) => ({
    name: step.name, detail, questId: `quest_morning_${i}`, icon: undefined as string | undefined,
  }));
  const morningDone = morningSteps.filter(({ questId }) => isQuestCompleted(questId)).length;

  // Weekly tasks
  const weeklyTasks = getWeeklyTasksForToday().map((t, i) => ({
    name: t.name, detail: undefined as string | undefined, questId: `quest_weekly_${i}`, icon: t.icon,
  }));
  const weeklyDone = weeklyTasks.filter(({ questId }) => isQuestCompleted(questId)).length;

  // Bedtime steps
  const bedtimeSteps = getActiveStepsForToday('bedtime').map(({ step, detail }, i) => ({
    name: step.name, detail, questId: `quest_bedtime_${i}`, icon: undefined as string | undefined,
  }));
  const bedtimeDone = bedtimeSteps.filter(({ questId }) => isQuestCompleted(questId)).length;

  // Save snapshot whenever completions change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    saveSnapshot({
      date: today,
      morningTotal: morningSteps.length,
      morningCompleted: morningDone,
      weeklyTotal: weeklyTasks.length,
      weeklyCompleted: weeklyDone,
      bedtimeTotal: bedtimeSteps.length,
      bedtimeCompleted: bedtimeDone,
    });
  }, [morningDone, weeklyDone, bedtimeDone, morningSteps.length, weeklyTasks.length, bedtimeSteps.length, saveSnapshot]);

  // Current phase items
  const activeItems = phase === 'morning' ? morningSteps
    : phase === 'weekly' ? weeklyTasks
    : phase === 'bedtime' ? bedtimeSteps
    : [];

  const totalAll = morningSteps.length + weeklyTasks.length + bedtimeSteps.length;
  const doneAll = morningDone + weeklyDone + bedtimeDone;
  const rate = totalAll === 0 ? 100 : Math.round((doneAll / totalAll) * 100);

  // Morning complete banner
  const morningComplete = morningDone === morningSteps.length && morningSteps.length > 0;

  return (
    <div className="flex flex-col h-full gap-1">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${rate}%`,
            backgroundColor: config.color,
            boxShadow: rate > 0 ? `0 0 6px ${config.color}40` : 'none',
          }}
        />
      </div>

      {/* Day header */}
      <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
        <span className="text-sm">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[9px] font-bold tracking-[0.15em]" style={{ color: config.color }}>
            {dayName} — {config.label}
          </p>
          <p className="font-mono text-[7px] text-cyber-text-dim/40 truncate">{dayMessage}</p>
        </div>
        <span
          className={`font-display text-xs font-bold flex-shrink-0 ${rate === 100 ? 'text-cyber-green text-glow-green' : ''}`}
          style={rate < 100 ? { color: config.color } : undefined}
        >
          {doneAll}/{totalAll}
        </span>
      </div>

      {/* Scrollable: current phase items */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {phase === 'off' ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
            <span className="text-2xl">😴</span>
            <p className="font-mono text-[10px] text-cyber-text-dim">Repos — Routine matin a 5h</p>
          </div>
        ) : (
          <>
            {activeItems.map(({ name, detail, questId, icon }) => (
              <StepRow
                key={questId}
                name={name}
                detail={detail}
                icon={icon}
                done={isQuestCompleted(questId)}
                color={config.color}
                onToggle={() => toggleQuest(questId)}
              />
            ))}

            {/* Morning complete + preview weekly */}
            {phase === 'morning' && morningComplete && (
              <div className="mt-1 px-2 py-1.5 rounded-lg" style={{ background: '#00ff8810', border: '1px solid #00ff8820' }}>
                <p className="font-display text-[8px] font-bold text-cyber-green text-center">
                  ROUTINE MATIN COMPLETE ✓
                </p>
                <p className="font-mono text-[7px] text-cyber-text-dim/40 text-center mt-0.5">
                  Programme hebdo a 9h
                </p>
              </div>
            )}

            {/* Show other phases dimmed */}
            {phase === 'weekly' && morningSteps.length > 0 && (
              <div className="mt-1 opacity-30">
                <div className="flex items-center gap-1 px-1 py-0.5">
                  <span className="text-[8px]">🌅</span>
                  <span className="font-display text-[7px] font-bold uppercase tracking-[0.1em] text-cyber-green/60">
                    MATIN
                  </span>
                  <span className="font-mono text-[7px] ml-auto text-cyber-text-dim/40">
                    {morningDone}/{morningSteps.length}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Completion badge */}
      {rate === 100 && (
        <div className="text-center py-0.5 rounded-lg" style={{ background: `${config.color}10`, border: `1px solid ${config.color}20` }}>
          <p className="font-display text-[8px] font-bold" style={{ color: config.color }}>
            TOUTES ROUTINES COMPLETES ✓
          </p>
        </div>
      )}
    </div>
  );
}

// ===================== EXPANDED TRACKER =====================
type TrackerTab = 'semaine' | 'mois' | 'annee';

function CyberTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cyber-bg-deep/95 border border-cyber-blue/30 rounded-lg px-3 py-2 shadow-neon-blue">
      <p className="font-mono text-[9px] text-cyber-text-dim mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-[10px] font-bold" style={{ color: entry.color }}>
          {entry.name}: {Math.round(entry.value)}%
        </p>
      ))}
    </div>
  );
}

function snapshotRate(s: DailyRoutineSnapshot): number {
  const total = s.morningTotal + s.weeklyTotal + s.bedtimeTotal;
  const completed = s.morningCompleted + s.weeklyCompleted + s.bedtimeCompleted;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function ExpandedTracker() {
  const [tab, setTab] = useState<TrackerTab>('semaine');
  const getWeekSnapshots = useRoutineTrackerStore((s) => s.getWeekSnapshots);
  const getMonthSnapshots = useRoutineTrackerStore((s) => s.getMonthSnapshots);
  const getYearMonthlyAverages = useRoutineTrackerStore((s) => s.getYearMonthlyAverages);
  const getBestStreak = useRoutineTrackerStore((s) => s.getBestStreak);
  const getCurrentStreak = useRoutineTrackerStore((s) => s.getCurrentStreak);
  const getAverageRate = useRoutineTrackerStore((s) => s.getAverageRate);

  const today = new Date().toISOString().split('T')[0];

  const bestStreak = getBestStreak();
  const currentStreak = getCurrentStreak();
  const avg30 = getAverageRate(30);

  const tabs: { id: TrackerTab; label: string }[] = [
    { id: 'semaine', label: 'Semaine' },
    { id: 'mois', label: 'Mois' },
    { id: 'annee', label: 'Annee' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats strip */}
      <div className="flex gap-3">
        <StatBox label="Streak actuel" value={`${currentStreak}j`} color={currentStreak > 0 ? '#00ff88' : '#666'} />
        <StatBox label="Meilleur streak" value={`${bestStreak}j`} color="#ffd700" />
        <StatBox label="Moy. 30j" value={`${avg30}%`} color={avg30 >= 80 ? '#00ff88' : avg30 >= 50 ? '#ffd700' : '#ff0040'} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              tab === t.id
                ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30'
                : 'text-cyber-text-dim hover:text-cyber-text border border-transparent hover:bg-white/[0.03]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {tab === 'semaine' && <WeekView snapshots={getWeekSnapshots()} today={today} />}
        {tab === 'mois' && <MonthView snapshots={getMonthSnapshots()} today={today} />}
        {tab === 'annee' && <YearView data={getYearMonthlyAverages()} />}
      </div>
    </div>
  );
}

function WeekView({ snapshots, today }: { snapshots: DailyRoutineSnapshot[]; today: string }) {
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="h-full flex flex-col gap-3">
      <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
        Completion par jour (matin / hebdo / soir)
      </p>
      <div className="flex gap-2 flex-1">
        {snapshots.map((snap, i) => {
          const isToday = snap.date === today;
          const morningRate = snap.morningTotal > 0 ? Math.round((snap.morningCompleted / snap.morningTotal) * 100) : 0;
          const weeklyRate = snap.weeklyTotal > 0 ? Math.round((snap.weeklyCompleted / snap.weeklyTotal) * 100) : 0;
          const bedtimeRate = snap.bedtimeTotal > 0 ? Math.round((snap.bedtimeCompleted / snap.bedtimeTotal) * 100) : 0;
          const globalRate = snapshotRate(snap);

          return (
            <div key={snap.date} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg ${isToday ? 'bg-white/[0.04] border border-cyber-blue/30' : 'bg-white/[0.02]'}`}>
              <span className={`font-mono text-[10px] font-bold ${isToday ? 'text-cyber-blue' : 'text-cyber-text-dim/60'}`}>
                {dayLabels[i]}
              </span>

              {/* Stacked mini bars */}
              <div className="flex flex-col gap-1 w-full flex-1 justify-end">
                <MiniBar rate={morningRate} color="#00ff88" label="M" />
                <MiniBar rate={weeklyRate} color="#00d4ff" label="H" />
                <MiniBar rate={bedtimeRate} color="#b400ff" label="S" />
              </div>

              <span className={`font-display text-sm font-bold ${
                globalRate >= 80 ? 'text-cyber-green' : globalRate >= 50 ? 'text-cyber-yellow' : globalRate > 0 ? 'text-cyber-red' : 'text-cyber-text-dim/20'
              }`}>
                {globalRate}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniBar({ rate, color, label }: { rate: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[7px] text-cyber-text-dim/40 w-3">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${rate}%`, backgroundColor: color + '90', boxShadow: rate > 0 ? `0 0 3px ${color}30` : 'none' }}
        />
      </div>
    </div>
  );
}

function MonthView({ snapshots, today }: { snapshots: DailyRoutineSnapshot[]; today: string }) {
  const firstDay = new Date(snapshots[0]?.date + 'T00:00:00');
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells: (DailyRoutineSnapshot | null)[] = Array(startDayOfWeek).fill(null).concat(snapshots);

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
        Heatmap du mois
      </p>
      <div className="grid grid-cols-7 gap-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center font-mono text-[8px] text-cyber-text-dim/40">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((snap, i) => {
          if (!snap) return <div key={i} />;
          const rate = snapshotRate(snap);
          const isToday = snap.date === today;
          const isFuture = snap.date > today;
          const dayNum = new Date(snap.date + 'T00:00:00').getDate();

          const bgOpacity = isFuture ? '08' : rate >= 80 ? '40' : rate >= 50 ? '25' : rate > 0 ? '15' : '06';
          const bgColor = isFuture ? '#ffffff' : '#00d4ff';

          return (
            <div
              key={snap.date}
              className={`rounded-md flex flex-col items-center justify-center p-1 transition-all ${isToday ? 'ring-1 ring-cyber-blue' : ''}`}
              style={{ backgroundColor: `${bgColor}${bgOpacity}` }}
            >
              <span className={`font-mono text-[9px] ${isToday ? 'text-cyber-blue font-bold' : isFuture ? 'text-cyber-text-dim/20' : 'text-cyber-text-dim/60'}`}>
                {dayNum}
              </span>
              {!isFuture && rate > 0 && (
                <span className={`font-mono text-[7px] ${rate >= 80 ? 'text-cyber-green' : rate >= 50 ? 'text-cyber-yellow' : 'text-cyber-red'}`}>
                  {rate}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ data }: { data: { month: string; avg: number }[] }) {
  const chartData = data.map((d) => ({
    name: d.month,
    avg: d.avg,
    fill: d.avg >= 80 ? '#00ff88' : d.avg >= 50 ? '#ffd700' : d.avg > 0 ? '#ff0040' : 'rgba(255,255,255,0.06)',
  }));

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
        Moyenne mensuelle
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#7a7a9e' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#7a7a9e' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CyberTooltip />} />
            <ReferenceLine y={80} stroke="#00ff88" strokeDasharray="5 5" strokeOpacity={0.3} label={{ value: '80%', position: 'right', fontSize: 8, fill: '#00ff88' }} />
            <Bar dataKey="avg" radius={[3, 3, 0, 0]} name="Moyenne" isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 bg-white/[0.03] rounded-lg p-3 flex flex-col items-center border border-white/[0.05]">
      <span className="font-display text-lg font-bold" style={{ color, textShadow: `0 0 6px ${color}40` }}>{value}</span>
      <span className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function RoutineWidget() {
  const phase = getCurrentPhase();
  const config = PHASE_CONFIG[phase];

  return (
    <WidgetPanel accent={config.accent} title="Routines" icon={config.icon} className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedTracker /> : <CompactRoutine />
      }
    </WidgetPanel>
  );
}
