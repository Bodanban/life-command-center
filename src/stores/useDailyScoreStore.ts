import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyScore {
  date: string;
  habitScore: number;      // 0-100 : % habitudes complétées
  objectiveScore: number;   // 0-100 : % objectifs complétés
  taskScore: number;        // 0-100 : % tâches complétées
  pomodoroSessions: number; // nombre de sessions
  globalScore: number;      // 0-100 : score pondéré
}

interface DailyScoreState {
  scores: DailyScore[];
  saveScore: (score: DailyScore) => void;
  getScore: (date: string) => DailyScore | undefined;
  getScores: (days: number) => DailyScore[];
  getStreak: () => number;
  getAverageScore: (days: number) => number;
  getBestScore: () => DailyScore | undefined;
  getTrend: () => 'up' | 'down' | 'stable';
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function dateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Score global pondéré :
// - Routines (matin+hebdo+soir) : 30%
// - Habitudes : 25%
// - Objectifs manuels : 20%
// - Tâches : 15%
// - Pomodoro : 10% (bonus productivité, plafonné à 100 pour 8 sessions)
export function calculateGlobalScore(
  habitScore: number,
  objectiveScore: number,
  taskScore: number,
  pomodoroSessions: number,
  routineRate?: number
): number {
  const pomodoroScore = Math.min(100, (pomodoroSessions / 8) * 100);
  const rr = routineRate ?? 0;
  return Math.round(
    rr * 0.30 +
    habitScore * 0.25 +
    objectiveScore * 0.20 +
    taskScore * 0.15 +
    pomodoroScore * 0.10
  );
}

export const useDailyScoreStore = create<DailyScoreState>()(
  persist(
    (set, get) => ({
      scores: [],

      saveScore: (score) => {
        set((state) => {
          const existing = state.scores.findIndex((s) => s.date === score.date);
          if (existing >= 0) {
            const updated = [...state.scores];
            updated[existing] = score;
            return { scores: updated };
          }
          return { scores: [...state.scores, score] };
        });
      },

      getScore: (date) => {
        return get().scores.find((s) => s.date === date);
      },

      getScores: (days) => {
        const result: DailyScore[] = [];
        const d = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const target = new Date(d);
          target.setDate(target.getDate() - i);
          const ds = dateString(target);
          const score = get().scores.find((s) => s.date === ds);
          result.push(
            score || {
              date: ds,
              habitScore: 0,
              objectiveScore: 0,
              taskScore: 0,
              pomodoroSessions: 0,
              globalScore: 0,
            }
          );
        }
        return result;
      },

      getStreak: () => {
        let streak = 0;
        const d = new Date();
        // Start from yesterday (today is still in progress)
        d.setDate(d.getDate() - 1);

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const ds = dateString(d);
          const score = get().scores.find((s) => s.date === ds);
          if (!score || score.globalScore < 70) break;
          streak++;
          d.setDate(d.getDate() - 1);
        }

        // Check if today is already above 70
        const today = todayString();
        const todayScore = get().scores.find((s) => s.date === today);
        if (todayScore && todayScore.globalScore >= 70) {
          streak++;
        }

        return streak;
      },

      getAverageScore: (days) => {
        const scores = get().getScores(days);
        const withData = scores.filter((s) => s.globalScore > 0);
        if (withData.length === 0) return 0;
        return Math.round(
          withData.reduce((sum, s) => sum + s.globalScore, 0) / withData.length
        );
      },

      getBestScore: () => {
        const scores = get().scores;
        if (scores.length === 0) return undefined;
        return scores.reduce((best, s) =>
          s.globalScore > best.globalScore ? s : best
        );
      },

      getTrend: () => {
        const scores = get().getScores(14);
        const withData = scores.filter((s) => s.globalScore > 0);
        if (withData.length < 3) return 'stable';

        const mid = Math.floor(withData.length / 2);
        const firstHalf = withData.slice(0, mid);
        const secondHalf = withData.slice(mid);

        const avgFirst = firstHalf.reduce((s, v) => s + v.globalScore, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((s, v) => s + v.globalScore, 0) / secondHalf.length;

        const diff = avgSecond - avgFirst;
        if (diff > 5) return 'up';
        if (diff < -5) return 'down';
        return 'stable';
      },
    }),
    { name: 'daily-score-store' }
  )
);
