import type { DailyScore } from '@/stores/useDailyScoreStore';
import type { Habit } from '@/types/app';

export interface Insight {
  icon: string;
  message: string;
  color: 'green' | 'red' | 'yellow' | 'gold' | 'purple' | 'blue';
  priority: number; // lower = more important
}

const colorMap = {
  green: '#00ff88',
  red: '#ff0040',
  yellow: '#ffd700',
  gold: '#ffd700',
  purple: '#b400ff',
  blue: '#00d4ff',
};

export function getInsightColor(color: Insight['color']): string {
  return colorMap[color];
}

export function generateInsights({
  scores,
  streak,
  trend,
  avgScore,
  bestScore,
  todayScore,
  habits,
  habitCompletions,
  totalTasks,
  completedTasks,
  totalObjectives,
  completedObjectives,
  pomodoroSessions,
  taskSessions,
  morningRoutineRate,
  bedtimeRoutineRate,
  weeklyRoutineRate,
}: {
  scores: DailyScore[];
  streak: number;
  trend: 'up' | 'down' | 'stable';
  avgScore: number;
  bestScore: DailyScore | undefined;
  todayScore: number;
  habits: Habit[];
  habitCompletions: Record<string, number>; // habitId -> completions in last 7 days
  totalTasks: number;
  completedTasks: number;
  totalObjectives: number;
  completedObjectives: number;
  pomodoroSessions: number;
  taskSessions: Record<string, number>;
  morningRoutineRate?: number;
  bedtimeRoutineRate?: number;
  weeklyRoutineRate?: number;
}): Insight[] {
  const insights: Insight[] = [];
  const hour = new Date().getHours();

  // Score parfait
  if (todayScore === 100) {
    insights.push({
      icon: '💯',
      message: 'SCORE PARFAIT ! Journee legendaire.',
      color: 'gold',
      priority: 0,
    });
  }

  // Meilleur jour
  if (bestScore && todayScore > 0 && todayScore >= bestScore.globalScore && todayScore > 50) {
    insights.push({
      icon: '🏆',
      message: 'Nouveau record ! Tu as battu ton meilleur score.',
      color: 'gold',
      priority: 1,
    });
  }

  // Streak en cours
  if (streak >= 7) {
    insights.push({
      icon: '🔥',
      message: `${streak} jours consecutifs au-dessus de 70% ! Inarretable.`,
      color: 'green',
      priority: 2,
    });
  } else if (streak >= 3) {
    insights.push({
      icon: '🔥',
      message: `${streak} jours de streak ! Continue comme ca.`,
      color: 'green',
      priority: 3,
    });
  }

  // Streak casse
  const yesterday = scores.length >= 2 ? scores[scores.length - 2] : undefined;
  if (yesterday && yesterday.globalScore < 70 && streak === 0) {
    const dayBefore = scores.length >= 3 ? scores[scores.length - 3] : undefined;
    if (dayBefore && dayBefore.globalScore >= 70) {
      insights.push({
        icon: '💔',
        message: 'Streak perdu hier. Recommence aujourd\'hui.',
        color: 'red',
        priority: 4,
      });
    }
  }

  // Tendance
  if (trend === 'up') {
    insights.push({
      icon: '📈',
      message: 'Ton score monte depuis 7 jours, continue !',
      color: 'green',
      priority: 5,
    });
  } else if (trend === 'down') {
    insights.push({
      icon: '📉',
      message: 'Score en baisse. Concentre-toi sur les habitudes.',
      color: 'yellow',
      priority: 5,
    });
  }

  // Pomodoro hero
  if (pomodoroSessions >= 8) {
    insights.push({
      icon: '🎯',
      message: `${pomodoroSessions} sessions pomodoro ! Productivite maximale.`,
      color: 'gold',
      priority: 6,
    });
  } else if (pomodoroSessions === 0 && hour >= 14) {
    insights.push({
      icon: '⏱',
      message: 'Aucune session pomodoro aujourd\'hui. Lance-en une !',
      color: 'yellow',
      priority: 7,
    });
  }

  // Habitude parfaite (7/7 cette semaine)
  const activeHabits = habits.filter((h) => h.is_active);
  for (const habit of activeHabits) {
    const count = habitCompletions[habit.id] || 0;
    if (count >= 7) {
      insights.push({
        icon: '✨',
        message: `'${habit.name}' parfaite cette semaine ! 7/7`,
        color: 'green',
        priority: 8,
      });
      break; // Only show one perfect habit
    }
  }

  // Habitude oubliee (la pire cette semaine)
  let worstHabit: { name: string; count: number } | null = null;
  for (const habit of activeHabits) {
    const count = habitCompletions[habit.id] || 0;
    if (count <= 2 && (!worstHabit || count < worstHabit.count)) {
      worstHabit = { name: habit.name, count };
    }
  }
  if (worstHabit) {
    insights.push({
      icon: '⚠️',
      message: `'${worstHabit.name}' n'est completee que ${worstHabit.count}/7 jours cette semaine.`,
      color: 'red',
      priority: 9,
    });
  }

  // Meilleure habitude (plus long streak)
  const bestHabit = activeHabits.reduce<Habit | null>((best, h) => {
    if (!best || h.current_streak > best.current_streak) return h;
    return best;
  }, null);
  if (bestHabit && bestHabit.current_streak >= 3) {
    insights.push({
      icon: '🏅',
      message: `'${bestHabit.name}' : ${bestHabit.current_streak} jours de streak !`,
      color: 'green',
      priority: 10,
    });
  }

  // Objectifs vides
  if (totalObjectives === 0 && hour < 12) {
    insights.push({
      icon: '📝',
      message: 'Definis tes objectifs du jour pour commencer.',
      color: 'blue',
      priority: 11,
    });
  }

  // Toutes les taches faites
  if (totalTasks > 0 && completedTasks === totalTasks) {
    insights.push({
      icon: '✅',
      message: 'Toutes les taches sont terminees ! Bravo.',
      color: 'green',
      priority: 6,
    });
  }

  // Routine matin completee
  if (morningRoutineRate !== undefined && morningRoutineRate === 100) {
    insights.push({
      icon: '🌅',
      message: 'Routine du matin completee ! Bien joue.',
      color: 'green',
      priority: 5,
    });
  }

  // Routine soir rappel
  if (bedtimeRoutineRate !== undefined && hour >= 21 && bedtimeRoutineRate < 50) {
    insights.push({
      icon: '🌙',
      message: 'N\'oublie pas ta routine du soir !',
      color: 'yellow',
      priority: 6,
    });
  }

  // Programme hebdomadaire
  if (weeklyRoutineRate !== undefined && weeklyRoutineRate === 100) {
    insights.push({
      icon: '📅',
      message: 'Programme hebdomadaire complete ! Tu geres.',
      color: 'green',
      priority: 5,
    });
  } else if (weeklyRoutineRate !== undefined && hour >= 18 && weeklyRoutineRate < 30) {
    insights.push({
      icon: '📅',
      message: 'Programme hebdo a peine entame. Il reste du temps !',
      color: 'yellow',
      priority: 7,
    });
  }

  // Weekend warrior check
  const weekdayScores: number[] = [];
  const weekendScores: number[] = [];
  for (const s of scores) {
    if (s.globalScore === 0) continue;
    const d = new Date(s.date + 'T00:00:00');
    const day = d.getDay();
    if (day === 0 || day === 6) weekendScores.push(s.globalScore);
    else weekdayScores.push(s.globalScore);
  }
  if (weekendScores.length >= 2 && weekdayScores.length >= 3) {
    const avgWeekend = weekendScores.reduce((a, b) => a + b, 0) / weekendScores.length;
    const avgWeekday = weekdayScores.reduce((a, b) => a + b, 0) / weekdayScores.length;
    if (avgWeekend > avgWeekday + 10) {
      insights.push({
        icon: '🦾',
        message: 'Plus productif le weekend que la semaine !',
        color: 'purple',
        priority: 12,
      });
    }
  }

  // Tache la plus travaillee (pomodoro)
  const topTaskEntries = Object.entries(taskSessions)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a);
  if (topTaskEntries.length > 0) {
    insights.push({
      icon: '💪',
      message: `${topTaskEntries.length} tache(s) avec 3+ sessions pomodoro. Focus total.`,
      color: 'blue',
      priority: 11,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
