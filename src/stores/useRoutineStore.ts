import { create } from 'zustand';

export interface RoutineStep {
  name: string;
  details: Record<number, string>; // 1=Lun, 2=Mar, ..., 7=Dim
  activeDays: number[]; // [1,2,3,4,5,6,7]
}

export interface WeeklyTask {
  name: string;
  icon: string;
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

// Programme hebdomadaire : 3 taches par jour (9h-21h)
const WEEKLY_TASKS: Record<number, WeeklyTask[]> = {
  1: [ // Lundi
    { name: 'Planifier la semaine', icon: '📋' },
    { name: 'Brainstorm contenu createur', icon: '💡' },
    { name: 'Ranger espace de vie', icon: '🏠' },
  ],
  2: [ // Mardi
    { name: 'Creer/filmer contenu', icon: '🎬' },
    { name: '30min apprentissage montage/storytelling', icon: '📚' },
    { name: 'Interagir communaute reseaux', icon: '💬' },
  ],
  3: [ // Mercredi
    { name: 'Soin visage approfondi', icon: '✨' },
    { name: 'Revue garde-robe/style', icon: '👔' },
    { name: 'Recherche tendances mode/grooming', icon: '🔍' },
  ],
  4: [ // Jeudi
    { name: 'Courses semaine (nourriture + produits)', icon: '🛒' },
    { name: 'Meal prep/planifier repas', icon: '🥗' },
    { name: 'Gestion administrative', icon: '📄' },
  ],
  5: [ // Vendredi
    { name: 'Sortir/voir des gens', icon: '🤝' },
    { name: 'Appeler famille/proches', icon: '📞' },
    { name: 'Bilan semaine + ajuster objectifs', icon: '🎯' },
  ],
  6: [ // Samedi
    { name: 'Activite plaisir/detente', icon: '🎮' },
    { name: 'Projet personnel/side hustle', icon: '🚀' },
    { name: 'Soins personnels approfondis', icon: '💆' },
  ],
  7: [ // Dimanche
    { name: 'Eglise/temps spirituel', icon: '⛪' },
    { name: 'Meditation longue + journaling', icon: '🧘' },
    { name: 'Preparer la semaine', icon: '📅' },
  ],
};

// JS getDay: 0=Dim, 1=Lun... → notre mapping: 1=Lun, 2=Mar... 7=Dim
export function getDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

// Phase based on hour: morning (5-9), weekly (9-21), bedtime (21-0), off (0-5)
export function getCurrentPhase(hour?: number): 'morning' | 'weekly' | 'bedtime' | 'off' {
  const h = hour ?? new Date().getHours();
  if (h >= 5 && h < 9) return 'morning';
  if (h >= 9 && h < 21) return 'weekly';
  if (h >= 21) return 'bedtime';
  return 'off'; // 0h-5h
}

export function getWeeklyTasksForToday(): WeeklyTask[] {
  const day = getDayOfWeek();
  return WEEKLY_TASKS[day] || [];
}

// Simplified store: only provides step data for display.
// All completion tracking is handled by useObjectiveStore (quest_morning_*, quest_bedtime_*, quest_weekly_*).
interface RoutineState {
  getActiveStepsForToday: (type: 'morning' | 'bedtime') => { step: RoutineStep; index: number; detail: string }[];
}

export const useRoutineStore = create<RoutineState>()(() => ({
  getActiveStepsForToday: (type) => {
    const day = getDayOfWeek();
    const steps = type === 'morning' ? MORNING_STEPS : BEDTIME_STEPS;
    return steps
      .map((step, index) => ({ step, index, detail: step.details[day] || '-' }))
      .filter(({ step }) => step.activeDays.includes(day));
  },
}));
