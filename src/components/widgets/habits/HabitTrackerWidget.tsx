'use client';

import { useState, useRef, useEffect } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import NeonInput from '@/components/ui/NeonInput';
import { useHabitStore } from '@/stores/useHabitStore';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function HabitTrackerWidget() {
  const {
    habits,
    addHabit,
    removeHabit,
    toggleLog,
    isCompletedOnDate,
    getStreak,
    initDefaultHabits,
    getTodayCompletionRate,
  } = useHabitStore();

  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const today = todayString();

  // Init default habits on first load
  useEffect(() => {
    initDefaultHabits();
  }, [initDefaultHabits]);

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

  // Generate last 7 days for mini grid
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const completionRate = getTodayCompletionRate();
  const completedToday = habits.filter((h) => h.is_active && isCompletedOnDate(h.id, today)).length;
  const totalActive = habits.filter((h) => h.is_active).length;

  return (
    <WidgetPanel accent="purple" title="Habitudes" icon="🔥" className="h-full">
      <div className="flex flex-col h-full gap-1">
        {/* Header with completion rate */}
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span
              className={`font-display text-sm font-bold ${
                completionRate === 100
                  ? 'text-cyber-green text-glow-green'
                  : completionRate >= 50
                  ? 'text-cyber-yellow'
                  : 'text-cyber-red text-glow-red'
              }`}
            >
              {completedToday}/{totalActive}
            </span>
            <span className="font-mono text-[9px] text-cyber-text-dim">
              {completionRate}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Mini progress bar */}
            <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionRate}%`,
                  backgroundColor:
                    completionRate === 100
                      ? '#00ff88'
                      : completionRate >= 50
                      ? '#ffd700'
                      : '#ff0040',
                  boxShadow:
                    completionRate === 100
                      ? '0 0 6px #00ff8860'
                      : undefined,
                }}
              />
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-cyber-purple/60 hover:text-cyber-purple text-xs transition-colors ml-1"
            >
              +
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="flex items-center gap-0.5 pl-[90px]">
          {last7Days.map((date) => {
            const d = new Date(date + 'T00:00:00');
            const dayIndex = d.getDay();
            const isToday = date === today;
            return (
              <div
                key={date}
                className={`w-5 h-3 flex items-center justify-center text-[8px] font-mono ${
                  isToday ? 'text-cyber-purple font-bold' : 'text-cyber-text-dim/40'
                }`}
              >
                {dayLabels[dayIndex === 0 ? 6 : dayIndex - 1]}
              </div>
            );
          })}
        </div>

        {/* Habits list - scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5">
          {habits.length === 0 ? (
            <p className="text-center text-cyber-text-dim/50 text-xs font-mono py-4">
              Chargement des habitudes...
            </p>
          ) : (
            habits.map((habit) => {
              const streak = getStreak(habit.id);
              const todayDone = isCompletedOnDate(habit.id, today);
              return (
                <div
                  key={habit.id}
                  className={`group flex items-center gap-0.5 py-0.5 px-1 rounded transition-all ${
                    todayDone ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  {/* Habit icon + name + streak */}
                  <div className="w-[90px] flex items-center gap-1 flex-shrink-0 overflow-hidden">
                    {habit.icon && (
                      <span className="text-[10px] flex-shrink-0">{habit.icon}</span>
                    )}
                    <span
                      className={`text-[10px] font-mono truncate ${
                        todayDone ? 'text-cyber-text-dim/60' : 'text-cyber-text'
                      }`}
                    >
                      {habit.name}
                    </span>
                    {streak > 0 && (
                      <span
                        className="text-[8px] font-display font-bold flex-shrink-0"
                        style={{ color: habit.color }}
                      >
                        {streak}
                      </span>
                    )}
                  </div>

                  {/* 7-day grid */}
                  <div className="flex items-center gap-0.5">
                    {last7Days.map((date) => {
                      const completed = isCompletedOnDate(habit.id, date);
                      const isToday = date === today;
                      return (
                        <button
                          key={date}
                          onClick={() => toggleLog(habit.id, date)}
                          className={`w-5 h-5 rounded-sm transition-all duration-200 flex items-center justify-center ${
                            completed
                              ? ''
                              : isToday
                              ? 'border border-dashed border-white/20 hover:border-white/40'
                              : 'bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                          style={
                            completed
                              ? {
                                  backgroundColor: habit.color + '25',
                                  boxShadow: `0 0 3px ${habit.color}30`,
                                  border: `1px solid ${habit.color}50`,
                                }
                              : undefined
                          }
                        >
                          {completed && (
                            <span className="text-[9px]" style={{ color: habit.color }}>
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-cyber-red/50 hover:text-cyber-red text-[8px] transition-opacity ml-0.5"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add habit (toggle) */}
        {showAdd && (
          <div className="flex gap-1 pt-1 border-t border-white/[0.06]">
            <NeonInput
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="+ Nouvelle habitude..."
              accent="purple"
              className="text-[10px]"
              autoFocus
            />
          </div>
        )}
      </div>
    </WidgetPanel>
  );
}
