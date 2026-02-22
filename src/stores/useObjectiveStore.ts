import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyObjective } from '@/types/app';

interface ObjectiveState {
  objectives: DailyObjective[];
  currentDate: string;

  addObjective: (title: string) => void;
  toggleObjective: (id: string) => void;
  removeObjective: (id: string) => void;
  checkDateReset: () => void;
  completionPercentage: () => number;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useObjectiveStore = create<ObjectiveState>()(
  persist(
    (set, get) => ({
      objectives: [],
      currentDate: todayString(),

      addObjective: (title: string) => {
        const objective: DailyObjective = {
          id: generateId(),
          user_id: 'local',
          title,
          is_completed: false,
          date: todayString(),
          sort_order: get().objectives.length,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ objectives: [...state.objectives, objective] }));
      },

      toggleObjective: (id: string) => {
        set((state) => ({
          objectives: state.objectives.map((obj) =>
            obj.id === id ? { ...obj, is_completed: !obj.is_completed } : obj
          ),
        }));
      },

      removeObjective: (id: string) => {
        set((state) => ({
          objectives: state.objectives.filter((obj) => obj.id !== id),
        }));
      },

      checkDateReset: () => {
        const today = todayString();
        if (get().currentDate !== today) {
          // New day: keep titles but reset completion
          set((state) => ({
            currentDate: today,
            objectives: state.objectives.map((obj) => ({
              ...obj,
              is_completed: false,
              date: today,
            })),
          }));
        }
      },

      completionPercentage: () => {
        const { objectives } = get();
        if (objectives.length === 0) return 0;
        const completed = objectives.filter((o) => o.is_completed).length;
        return Math.round((completed / objectives.length) * 100);
      },
    }),
    { name: 'objective-store' }
  )
);
