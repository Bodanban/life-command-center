import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyRoutineSnapshot {
  date: string; // YYYY-MM-DD
  morningTotal: number;
  morningCompleted: number;
  weeklyTotal: number;
  weeklyCompleted: number;
  bedtimeTotal: number;
  bedtimeCompleted: number;
}

interface RoutineTrackerState {
  snapshots: DailyRoutineSnapshot[];
  saveSnapshot: (snapshot: DailyRoutineSnapshot) => void;
  getSnapshot: (date: string) => DailyRoutineSnapshot | undefined;
  getWeekSnapshots: () => DailyRoutineSnapshot[];
  getMonthSnapshots: () => DailyRoutineSnapshot[];
  getYearMonthlyAverages: () => { month: string; avg: number }[];
  getBestStreak: () => number;
  getCurrentStreak: () => number;
  getAverageRate: (days: number) => number;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function dateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function snapshotRate(s: DailyRoutineSnapshot): number {
  const total = s.morningTotal + s.weeklyTotal + s.bedtimeTotal;
  const completed = s.morningCompleted + s.weeklyCompleted + s.bedtimeCompleted;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export const useRoutineTrackerStore = create<RoutineTrackerState>()(
  persist(
    (set, get) => ({
      snapshots: [],

      saveSnapshot: (snapshot) => {
        set((state) => {
          const idx = state.snapshots.findIndex((s) => s.date === snapshot.date);
          if (idx >= 0) {
            const updated = [...state.snapshots];
            updated[idx] = snapshot;
            return { snapshots: updated };
          }
          // Keep max 400 days of history
          const snaps = [...state.snapshots, snapshot];
          if (snaps.length > 400) snaps.splice(0, snaps.length - 400);
          return { snapshots: snaps };
        });
      },

      getSnapshot: (date) => get().snapshots.find((s) => s.date === date),

      getWeekSnapshots: () => {
        const result: DailyRoutineSnapshot[] = [];
        const d = new Date();
        const jsDay = d.getDay();
        const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
        for (let i = 0; i < 7; i++) {
          const target = new Date(d);
          target.setDate(d.getDate() + mondayOffset + i);
          const ds = dateString(target);
          const snap = get().snapshots.find((s) => s.date === ds);
          result.push(snap || { date: ds, morningTotal: 0, morningCompleted: 0, weeklyTotal: 0, weeklyCompleted: 0, bedtimeTotal: 0, bedtimeCompleted: 0 });
        }
        return result;
      },

      getMonthSnapshots: () => {
        const result: DailyRoutineSnapshot[] = [];
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const target = new Date(year, month, i);
          const ds = dateString(target);
          const snap = get().snapshots.find((s) => s.date === ds);
          result.push(snap || { date: ds, morningTotal: 0, morningCompleted: 0, weeklyTotal: 0, weeklyCompleted: 0, bedtimeTotal: 0, bedtimeCompleted: 0 });
        }
        return result;
      },

      getYearMonthlyAverages: () => {
        const now = new Date();
        const year = now.getFullYear();
        const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((label, m) => {
          const monthSnaps = get().snapshots.filter((s) => {
            const d = new Date(s.date + 'T00:00:00');
            return d.getFullYear() === year && d.getMonth() === m;
          });
          if (monthSnaps.length === 0) return { month: label, avg: 0 };
          const totalRate = monthSnaps.reduce((sum, s) => sum + snapshotRate(s), 0);
          return { month: label, avg: Math.round(totalRate / monthSnaps.length) };
        });
      },

      getBestStreak: () => {
        const sorted = [...get().snapshots].sort((a, b) => a.date.localeCompare(b.date));
        let best = 0;
        let current = 0;
        for (const s of sorted) {
          if (snapshotRate(s) >= 80) {
            current++;
            if (current > best) best = current;
          } else {
            current = 0;
          }
        }
        return best;
      },

      getCurrentStreak: () => {
        const today = todayString();
        let streak = 0;
        const d = new Date();
        d.setDate(d.getDate() - 1); // Start from yesterday
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const ds = dateString(d);
          const snap = get().snapshots.find((s) => s.date === ds);
          if (!snap || snapshotRate(snap) < 80) break;
          streak++;
          d.setDate(d.getDate() - 1);
        }
        // Check today
        const todaySnap = get().snapshots.find((s) => s.date === today);
        if (todaySnap && snapshotRate(todaySnap) >= 80) streak++;
        return streak;
      },

      getAverageRate: (days) => {
        const d = new Date();
        let total = 0;
        let count = 0;
        for (let i = 0; i < days; i++) {
          const ds = dateString(d);
          const snap = get().snapshots.find((s) => s.date === ds);
          if (snap && snapshotRate(snap) > 0) {
            total += snapshotRate(snap);
            count++;
          }
          d.setDate(d.getDate() - 1);
        }
        return count > 0 ? Math.round(total / count) : 0;
      },
    }),
    { name: 'routine-tracker-store' }
  )
);
