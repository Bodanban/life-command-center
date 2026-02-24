import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitLog } from '@/types/app';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  _initialized: boolean;

  addHabit: (name: string, color?: string, icon?: string) => void;
  removeHabit: (id: string) => void;
  toggleLog: (habitId: string, date?: string) => void;
  isCompletedOnDate: (habitId: string, date: string) => boolean;
  getStreak: (habitId: string) => number;
  getLogsForHabit: (habitId: string, days: number) => Record<string, boolean>;
  initDefaultHabits: () => void;
  getTodayCompletionRate: () => number;
  getUncompletedToday: () => Habit[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function dateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Habitudes du TRACKER HABIT - tes non-négociables quotidiens
// (les quêtes sport 50 Pompes/Squats/Crunchs sont dans les Objectifs du Jour)
const DEFAULT_HABITS: { name: string; color: string; icon: string }[] = [
  { name: 'Prière', color: '#ffd700', icon: '🙏' },
  { name: 'Dormir à 23h', color: '#7b68ee', icon: '🌙' },
  { name: 'Méditation', color: '#b400ff', icon: '🧘' },
  { name: '4H Work', color: '#00d4ff', icon: '💻' },
  { name: 'Sport', color: '#00ff88', icon: '💪' },
  { name: 'Lecture 15 Pages', color: '#ff6ec7', icon: '📖' },
  { name: 'Tracking', color: '#00d4ff', icon: '📊' },
  { name: 'Visualisation', color: '#b400ff', icon: '🎯' },
  { name: 'Journaling', color: '#ffd700', icon: '✍️' },
  { name: '1 Vidéo/j', color: '#ff4500', icon: '🎬' },
  { name: 'No Fap', color: '#ff0040', icon: '🛡️' },
  { name: 'No Alcohol', color: '#ff0040', icon: '🚫' },
  { name: 'No Cigarettes', color: '#ff0040', icon: '🚭' },
];

// Habits that were moved to daily objectives - auto-remove from habit tracker
const REMOVED_HABITS = ['50 Pompes', '50 Squats', '50 Crunchs'];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      _initialized: false,

      addHabit: (name, color = '#00d4ff', icon) => {
        const habit: Habit = {
          id: generateId(),
          user_id: 'local',
          name,
          color,
          icon,
          is_active: true,
          current_streak: 0,
          longest_streak: 0,
          sort_order: get().habits.length,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      removeHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habit_id !== id),
        }));
      },

      toggleLog: (habitId, date) => {
        const targetDate = date || todayString();
        const existing = get().logs.find(
          (l) => l.habit_id === habitId && l.date === targetDate
        );

        if (existing) {
          set((state) => ({
            logs: state.logs.filter((l) => l.id !== existing.id),
          }));
        } else {
          const log: HabitLog = {
            id: generateId(),
            habit_id: habitId,
            user_id: 'local',
            date: targetDate,
            completed: true,
            created_at: new Date().toISOString(),
          };
          set((state) => ({ logs: [...state.logs, log] }));
        }

        // Recalculate streak
        const streak = get().getStreak(habitId);
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  current_streak: streak,
                  longest_streak: Math.max(h.longest_streak, streak),
                }
              : h
          ),
        }));
      },

      isCompletedOnDate: (habitId, date) => {
        return get().logs.some(
          (l) => l.habit_id === habitId && l.date === date && l.completed
        );
      },

      getStreak: (habitId) => {
        let streak = 0;
        const d = new Date();

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const ds = dateString(d);
          const found = get().logs.some(
            (l) => l.habit_id === habitId && l.date === ds && l.completed
          );
          if (!found) break;
          streak++;
          d.setDate(d.getDate() - 1);
        }

        return streak;
      },

      getLogsForHabit: (habitId, days) => {
        const result: Record<string, boolean> = {};
        const d = new Date();
        for (let i = 0; i < days; i++) {
          const ds = dateString(d);
          result[ds] = get().isCompletedOnDate(habitId, ds);
          d.setDate(d.getDate() - 1);
        }
        return result;
      },

      initDefaultHabits: () => {
        let existing = get().habits;
        // Auto-remove habits that were moved to daily objectives
        const removedSet = new Set(REMOVED_HABITS);
        const hadRemoved = existing.some((h) => removedSet.has(h.name));
        if (hadRemoved) {
          existing = existing.filter((h) => !removedSet.has(h.name));
        }
        if (existing.length === 0) {
          // First time: create all defaults
          const habits: Habit[] = DEFAULT_HABITS.map((h, i) => ({
            id: `default_${i}_${Date.now().toString(36)}`,
            user_id: 'local',
            name: h.name,
            color: h.color,
            icon: h.icon,
            is_active: true,
            current_streak: 0,
            longest_streak: 0,
            sort_order: i,
            created_at: new Date().toISOString(),
          }));
          set({ habits, _initialized: true });
          return;
        }
        // Add any missing default habits
        const existingNames = new Set(existing.map((h) => h.name));
        const missing = DEFAULT_HABITS.filter((h) => !existingNames.has(h.name));
        if (missing.length > 0 || hadRemoved) {
          const newHabits: Habit[] = missing.map((h, i) => ({
            id: `default_${existing.length + i}_${Date.now().toString(36)}`,
            user_id: 'local',
            name: h.name,
            color: h.color,
            icon: h.icon,
            is_active: true,
            current_streak: 0,
            longest_streak: 0,
            sort_order: existing.length + i,
            created_at: new Date().toISOString(),
          }));
          set({ habits: [...existing, ...newHabits], _initialized: true });
        } else {
          set({ _initialized: true });
        }
      },

      getTodayCompletionRate: () => {
        const today = todayString();
        const activeHabits = get().habits.filter((h) => h.is_active);
        if (activeHabits.length === 0) return 100;
        const completed = activeHabits.filter((h) =>
          get().isCompletedOnDate(h.id, today)
        ).length;
        return Math.round((completed / activeHabits.length) * 100);
      },

      getUncompletedToday: () => {
        const today = todayString();
        return get()
          .habits.filter((h) => h.is_active && !get().isCompletedOnDate(h.id, today));
      },
    }),
    { name: 'habit-store' }
  )
);
