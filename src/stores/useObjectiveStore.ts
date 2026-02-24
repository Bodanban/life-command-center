import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyObjective } from '@/types/app';
import { getCurrentPhase, getWeeklyTasksForToday } from '@/stores/useRoutineStore';

// ===== QUETES QUOTIDIENNES AUTO-GENEREES =====

export interface DailyQuest {
  id: string;
  title: string;
  icon: string;
  category: 'sport' | 'routine_matin' | 'routine_soir' | 'routine_weekly';
  color: string;
}

// Quetes sport quotidiennes — toujours visibles
const SPORT_QUESTS: DailyQuest[] = [
  { id: 'quest_sport_pompes', title: '50 Pompes', icon: '🏋️', category: 'sport', color: '#00ff88' },
  { id: 'quest_sport_squats', title: '50 Squats', icon: '🦵', category: 'sport', color: '#00d4ff' },
  { id: 'quest_sport_crunchs', title: '50 Crunchs', icon: '🔥', category: 'sport', color: '#ff6ec7' },
];

// Helper: current day of week (1=Lun..7=Dim)
function getDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

// Morning routine quests (from routine store data, same IDs as RoutineWidget uses)
function getMorningQuests(): DailyQuest[] {
  const day = getDayOfWeek();
  const steps: { name: string; icon: string; activeDays: number[] }[] = [
    { name: 'Je bois l\'eau', icon: '💧', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Priere 15min', icon: '🙏', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Sport / Affirmation', icon: '💪', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Se Laver / Skin Care', icon: '🧴', activeDays: [1,2,3,4,5,6] },
    { name: 'Meditation / Visualisation', icon: '🧘', activeDays: [1,2,3,4,5,6] },
    { name: 'Cafeine / Biofar', icon: '☕', activeDays: [1,2,4,5,6] },
  ];

  return steps
    .filter((s) => s.activeDays.includes(day))
    .map((s, i) => ({
      id: `quest_morning_${i}`,
      title: s.name,
      icon: s.icon,
      category: 'routine_matin' as const,
      color: '#00ff88',
    }));
}

// Bedtime routine quests
function getBedtimeQuests(): DailyQuest[] {
  const day = getDayOfWeek();
  const steps: { name: string; icon: string; activeDays: number[] }[] = [
    { name: 'Journaling & Planification', icon: '✍️', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Preparer tenue', icon: '👔', activeDays: [1,2,3,4,5,7] },
    { name: 'Hygiene', icon: '🪥', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Priere du soir', icon: '🙏', activeDays: [1,2,3,4,5,6,7] },
    { name: 'Lire', icon: '📖', activeDays: [1,2,3,4,5,6,7] },
  ];

  return steps
    .filter((s) => s.activeDays.includes(day))
    .map((s, i) => ({
      id: `quest_bedtime_${i}`,
      title: s.name,
      icon: s.icon,
      category: 'routine_soir' as const,
      color: '#b400ff',
    }));
}

// Weekly programme quests (from routine store weekly tasks)
function getWeeklyQuests(): DailyQuest[] {
  const tasks = getWeeklyTasksForToday();
  return tasks.map((t, i) => ({
    id: `quest_weekly_${i}`,
    title: t.name,
    icon: t.icon,
    category: 'routine_weekly' as const,
    color: '#00d4ff',
  }));
}

// Phase-aware: get quests visible in Objectifs du Jour based on current hour
export function getTodayQuests(hour?: number): DailyQuest[] {
  const phase = getCurrentPhase(hour);
  switch (phase) {
    case 'morning':
      return [...getMorningQuests(), ...SPORT_QUESTS];
    case 'weekly':
      return [...getWeeklyQuests(), ...SPORT_QUESTS];
    case 'bedtime':
      return [...getBedtimeQuests(), ...SPORT_QUESTS];
    case 'off':
      return [...SPORT_QUESTS];
  }
}

// Get ALL quests including morning + bedtime + weekly (for global score calculation)
export function getAllTodayQuests(): DailyQuest[] {
  return [...SPORT_QUESTS, ...getMorningQuests(), ...getBedtimeQuests(), ...getWeeklyQuests()];
}

// Get morning quest count for stats
export function getMorningQuestCount(): { total: number; ids: string[] } {
  const quests = getMorningQuests();
  return { total: quests.length, ids: quests.map(q => q.id) };
}

// Get bedtime quest count for stats
export function getBedtimeQuestCount(): { total: number; ids: string[] } {
  const quests = getBedtimeQuests();
  return { total: quests.length, ids: quests.map(q => q.id) };
}

// Get weekly quest count for stats
export function getWeeklyQuestCount(): { total: number; ids: string[] } {
  const quests = getWeeklyQuests();
  return { total: quests.length, ids: quests.map(q => q.id) };
}

// ===== STORE =====

interface ObjectiveState {
  objectives: DailyObjective[];
  questCompletions: Record<string, boolean>;
  currentDate: string;

  addObjective: (title: string) => void;
  toggleObjective: (id: string) => void;
  removeObjective: (id: string) => void;
  toggleQuest: (questId: string) => void;
  isQuestCompleted: (questId: string) => boolean;
  checkDateReset: () => void;
  completionPercentage: () => number;
  getQuestCompletionCount: () => { completed: number; total: number };
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
      questCompletions: {},
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

      toggleQuest: (questId: string) => {
        const today = todayString();
        const key = `${questId}_${today}`;
        set((state) => {
          const newCompletions = { ...state.questCompletions };
          if (newCompletions[key]) {
            delete newCompletions[key];
          } else {
            newCompletions[key] = true;
          }
          return { questCompletions: newCompletions };
        });
      },

      isQuestCompleted: (questId: string) => {
        const today = todayString();
        return !!get().questCompletions[`${questId}_${today}`];
      },

      checkDateReset: () => {
        const today = todayString();
        if (get().currentDate !== today) {
          const newQuestCompletions: Record<string, boolean> = {};
          for (const [key, val] of Object.entries(get().questCompletions)) {
            if (key.endsWith(today)) {
              newQuestCompletions[key] = val;
            }
          }
          set((state) => ({
            currentDate: today,
            questCompletions: newQuestCompletions,
            objectives: state.objectives.map((obj) => ({
              ...obj,
              is_completed: false,
              date: today,
            })),
          }));
        }
      },

      completionPercentage: () => {
        const state = get();
        const quests = getAllTodayQuests();
        const completedQuests = quests.filter((q) => state.isQuestCompleted(q.id)).length;
        const completedManual = state.objectives.filter((o) => o.is_completed).length;
        const total = quests.length + state.objectives.length;
        if (total === 0) return 0;
        return Math.round(((completedQuests + completedManual) / total) * 100);
      },

      getQuestCompletionCount: () => {
        const state = get();
        const quests = getAllTodayQuests();
        return {
          completed: quests.filter((q) => state.isQuestCompleted(q.id)).length,
          total: quests.length,
        };
      },
    }),
    {
      name: 'objective-store',
      partialize: (state) => ({
        objectives: state.objectives,
        questCompletions: state.questCompletions,
        currentDate: state.currentDate,
      }),
    }
  )
);
