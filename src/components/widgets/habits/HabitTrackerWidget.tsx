'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonInput from '@/components/ui/NeonInput';
import { useHabitStore } from '@/stores/useHabitStore';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function dateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ===================== COMPACT VIEW =====================
function CompactHabits() {
  const {
    habits, addHabit, removeHabit, toggleLog, isCompletedOnDate, getStreak,
    initDefaultHabits, getTodayCompletionRate,
  } = useHabitStore();

  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const today = todayString();

  useEffect(() => { initDefaultHabits(); }, [initDefaultHabits]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const colors = ['#00d4ff', '#00ff88', '#b400ff', '#ff6ec7', '#ffd700'];
    addHabit(name, colors[habits.length % colors.length]);
    setNewName('');
    setShowAdd(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowAdd(false);
  };

  const last7Days = (() => {
    const now = new Date();
    const jsDay = now.getDay();
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() + mondayOffset + i);
      return d.toISOString().split('T')[0];
    });
  })();

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const completionRate = getTodayCompletionRate();
  const completedToday = habits.filter((h) => h.is_active && isCompletedOnDate(h.id, today)).length;
  const totalActive = habits.filter((h) => h.is_active).length;

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className={`font-display text-sm font-bold ${
            completionRate === 100 ? 'text-cyber-green text-glow-green' : completionRate >= 50 ? 'text-cyber-yellow' : 'text-cyber-red text-glow-red'
          }`}>
            {completedToday}/{totalActive}
          </span>
          <span className="font-mono text-[9px] text-cyber-text-dim">{completionRate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                backgroundColor: completionRate === 100 ? '#00ff88' : completionRate >= 50 ? '#ffd700' : '#ff0040',
                boxShadow: completionRate === 100 ? '0 0 6px #00ff8860' : undefined,
              }}
            />
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="text-cyber-purple/60 hover:text-cyber-purple text-xs transition-colors ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0.5 pl-[90px]">
        {last7Days.map((date, i) => {
          const isToday = date === today;
          return (
            <div key={date} className={`w-5 h-3 flex items-center justify-center text-[8px] font-mono ${isToday ? 'text-cyber-purple font-bold' : 'text-cyber-text-dim/40'}`}>
              {dayLabels[i]}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5">
        {habits.length === 0 ? (
          <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-4">Chargement des habitudes...</p>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.id);
            const todayDone = isCompletedOnDate(habit.id, today);
            return (
              <div key={habit.id} className={`group flex items-center gap-0.5 py-0.5 px-1 rounded transition-all ${todayDone ? 'bg-white/[0.02]' : ''}`}>
                <div className="w-[90px] flex items-center gap-1 flex-shrink-0 overflow-hidden">
                  {habit.icon && <span className="text-[10px] flex-shrink-0">{habit.icon}</span>}
                  <span className={`text-[10px] font-mono truncate ${todayDone ? 'text-cyber-text-dim/60' : 'text-cyber-text'}`}>{habit.name}</span>
                  {streak > 0 && (
                    <span className="text-[8px] font-display font-bold flex-shrink-0" style={{ color: habit.color }}>{streak}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {last7Days.map((date) => {
                    const completed = isCompletedOnDate(habit.id, date);
                    const isToday = date === today;
                    return (
                      <button
                        key={date} onClick={() => toggleLog(habit.id, date)}
                        className={`w-5 h-5 rounded-sm transition-all duration-200 flex items-center justify-center ${
                          completed ? '' : isToday ? 'border border-dashed border-white/20 hover:border-white/40' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                        style={completed ? { backgroundColor: habit.color + '25', boxShadow: `0 0 3px ${habit.color}30`, border: `1px solid ${habit.color}50` } : undefined}
                      >
                        {completed && <span className="text-[9px]" style={{ color: habit.color }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { if (confirm(`Supprimer l'habitude "${habit.name}" ?`)) removeHabit(habit.id); }}
                  className="opacity-0 group-hover:opacity-100 active:opacity-100 text-cyber-red/50 hover:text-cyber-red text-[8px] transition-opacity ml-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <div className="flex gap-1 pt-1 border-t border-white/[0.06]">
          <NeonInput
            ref={inputRef} value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="+ Nouvelle habitude..." accent="purple" className="text-[10px]" autoFocus
          />
        </div>
      )}
    </div>
  );
}

// ===================== EXPANDED VIEW =====================
function ExpandedHabits() {
  const { habits, isCompletedOnDate, getStreak } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const activeHabits = habits.filter((h) => h.is_active);

  // 30-day data per habit
  const habitData = useMemo(() => {
    return activeHabits.map((h) => {
      let completions = 0;
      const d = new Date();
      const days: boolean[] = [];
      for (let i = 29; i >= 0; i--) {
        const target = new Date();
        target.setDate(d.getDate() - i);
        const done = isCompletedOnDate(h.id, dateString(target));
        days.push(done);
        if (done) completions++;
      }
      const rate = Math.round((completions / 30) * 100);
      const streak = getStreak(h.id);
      return { ...h, completions, rate, streak, days };
    }).sort((a, b) => a.rate - b.rate); // Weakest first
  }, [activeHabits, isCompletedOnDate, getStreak]);

  const selected = selectedHabitId ? habitData.find((h) => h.id === selectedHabitId) : habitData[0];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Habit list + regularity */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
            Regularite (30 derniers jours) — les plus faibles en premier
          </p>
          {habitData.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                selected?.id === h.id ? 'bg-white/[0.06] border border-white/[0.1]' : 'bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {h.icon && <span className="text-sm">{h.icon}</span>}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[11px] text-cyber-text truncate">{h.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${h.rate}%`,
                        backgroundColor: h.rate >= 80 ? '#00ff88' : h.rate >= 50 ? '#ffd700' : '#ff0040',
                      }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-cyber-text-dim/60 w-8 text-right">{h.rate}%</span>
                </div>
              </div>
              {h.streak > 0 && (
                <span className="font-display text-sm font-bold flex-shrink-0" style={{ color: h.color }}>
                  {h.streak}🔥
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: Heatmap 30 days for selected habit */}
        <div className="flex-1 flex flex-col gap-3">
          {selected && (
            <>
              <div className="flex items-center gap-2">
                {selected.icon && <span className="text-lg">{selected.icon}</span>}
                <span className="font-display text-sm font-bold" style={{ color: selected.color }}>
                  {selected.name}
                </span>
                <span className="ml-auto font-mono text-[10px] text-cyber-text-dim">
                  {selected.completions}/30 jours · streak: {selected.streak}
                </span>
              </div>

              {/* 30-day heatmap grid (6 rows x 5 cols) */}
              <div className="grid grid-cols-10 gap-1.5">
                {selected.days.map((done, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - 29 + i);
                  const isToday = dateString(d) === todayString();
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-[8px] font-mono ${isToday ? 'ring-1 ring-cyber-blue' : ''}`}
                      style={{
                        backgroundColor: done ? selected.color + '30' : 'rgba(255,255,255,0.04)',
                        border: done ? `1px solid ${selected.color}50` : '1px solid transparent',
                      }}
                    >
                      <span className={done ? '' : 'text-cyber-text-dim/20'}>
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: selected.color + '30', border: `1px solid ${selected.color}50` }} />
                  <span className="font-mono text-[8px] text-cyber-text-dim/60">Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-white/[0.04]" />
                  <span className="font-mono text-[8px] text-cyber-text-dim/60">Manque</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function HabitTrackerWidget() {
  return (
    <WidgetPanel accent="purple" title="Habitudes" icon="🔥" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedHabits /> : <CompactHabits />
      }
    </WidgetPanel>
  );
}
