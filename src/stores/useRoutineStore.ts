import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RoutineStep {
  name: string;
  details: Record<number, string>; // 1=Lun, 2=Mar, ..., 7=Dim
  activeDays: number[]; // [1,2,3,4,5,6,7]
}

const MORNING_STEPS: RoutineStep[] = [
  {
    name: 'Je bois l\'eau',
    details: { 1: 'Eau', 2: 'Eau', 3: 'Eau', 4: 'Eau', 5: 'Eau', 6: 'Eau', 7: 'Eau' },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Priere 15min',
    details: {
      1: 'Louange et adoration',
      2: 'Consecration semaine',
      3: 'Confession repentance',
      4: 'Demande guidance',
      5: 'Action de grace',
      6: 'Priere pour le monde',
      7: 'Remerciement',
    },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Sport / Affirmation',
    details: {
      1: 'Je suis discipline et je progresse chaque jour',
      2: 'Je merite le succes et je travaille pour',
      3: 'Mon corps est un temple, je le respecte',
      4: 'Je suis capable de tout ce que je veux accomplir',
      5: 'La victoire est mon habitude',
      6: 'Je suis en forme et plein d\'energie',
      7: 'Je suis reconnaissant pour ma sante',
    },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Se Laver / Skin Care',
    details: {
      1: 'Lavage cheveux',
      2: 'Gommage visage',
      3: 'Epilation / rasage',
      4: 'Nettoyage pieds',
      5: 'Lavage cheveux',
      6: 'Hydratation corps',
      7: '-',
    },
    activeDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Meditation / Visualisation',
    details: {
      1: 'System Key Exo',
      2: 'Futur',
      3: 'System Key Evo',
      4: 'Futur',
      5: 'System Key Evo',
      6: 'Futur',
      7: '-',
    },
    activeDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Cafeine / Biofar',
    details: {
      1: 'C + B',
      2: 'B',
      3: '-',
      4: 'B',
      5: 'C + B',
      6: 'B',
      7: '-',
    },
    activeDays: [1, 2, 4, 5, 6],
  },
];

const BEDTIME_STEPS: RoutineStep[] = [
  {
    name: 'Journaling & Planification',
    details: { 1: 'Bilan + plan demain', 2: 'Bilan + plan demain', 3: 'Bilan + plan demain', 4: 'Bilan + plan demain', 5: 'Bilan + plan demain', 6: 'Bilan + plan demain', 7: 'Bilan + plan demain' },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Preparer tenues lendemain',
    details: { 1: 'Tenue', 2: 'Tenue', 3: 'Tenue', 4: 'Tenue', 5: 'Tenue', 6: '-', 7: 'Tenue' },
    activeDays: [1, 2, 3, 4, 5, 7],
  },
  {
    name: 'Hygiene',
    details: { 1: 'Hygiene', 2: 'Hygiene', 3: 'Hygiene', 4: 'Hygiene', 5: 'Hygiene', 6: 'Hygiene', 7: 'Hygiene' },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Priere',
    details: { 1: 'Priere', 2: 'Priere', 3: 'Priere', 4: 'Priere', 5: 'Priere', 6: 'Priere', 7: 'Priere' },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Lire',
    details: { 1: 'Lecture', 2: 'Lecture', 3: 'Lecture', 4: 'Lecture', 5: 'Lecture', 6: 'Lecture', 7: 'Lecture' },
    activeDays: [1, 2, 3, 4, 5, 6, 7],
  },
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// JS getDay: 0=Dim, 1=Lun... → notre mapping: 1=Lun, 2=Mar... 7=Dim
function getDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

interface RoutineState {
  completions: Record<string, boolean>; // "morning_0_2026-02-23" → true
  lastDate: string;
  toggleStep: (type: 'morning' | 'bedtime', stepIndex: number) => void;
  isStepCompleted: (type: 'morning' | 'bedtime', stepIndex: number) => boolean;
  getActiveStepsForToday: (type: 'morning' | 'bedtime') => { step: RoutineStep; index: number; detail: string }[];
  getCompletionRate: (type: 'morning' | 'bedtime') => number;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      completions: {},
      lastDate: getTodayString(),

      toggleStep: (type, stepIndex) => {
        const today = getTodayString();
        const key = `${type}_${stepIndex}_${today}`;
        set((state) => {
          const newCompletions = { ...state.completions };
          if (newCompletions[key]) {
            delete newCompletions[key];
          } else {
            newCompletions[key] = true;
          }
          return { completions: newCompletions, lastDate: today };
        });
      },

      isStepCompleted: (type, stepIndex) => {
        const today = getTodayString();
        const state = get();
        // Auto-reset if date changed
        if (state.lastDate !== today) {
          // Clear old completions
          const newCompletions: Record<string, boolean> = {};
          for (const [key, val] of Object.entries(state.completions)) {
            if (key.endsWith(today)) {
              newCompletions[key] = val;
            }
          }
          set({ completions: newCompletions, lastDate: today });
        }
        return !!state.completions[`${type}_${stepIndex}_${today}`];
      },

      getActiveStepsForToday: (type) => {
        const day = getDayOfWeek();
        const steps = type === 'morning' ? MORNING_STEPS : BEDTIME_STEPS;
        return steps
          .map((step, index) => ({ step, index, detail: step.details[day] || '-' }))
          .filter(({ step }) => step.activeDays.includes(day));
      },

      getCompletionRate: (type) => {
        const state = get();
        const activeSteps = state.getActiveStepsForToday(type);
        if (activeSteps.length === 0) return 100;
        const completed = activeSteps.filter(({ index }) =>
          state.isStepCompleted(type, index)
        ).length;
        return Math.round((completed / activeSteps.length) * 100);
      },
    }),
    {
      name: 'life-command-routine',
      partialize: (state) => ({
        completions: state.completions,
        lastDate: state.lastDate,
      }),
    }
  )
);
