export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  is_completed: boolean;
  completed_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyObjective {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  date: string;
  sort_order: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  current_streak: number;
  longest_streak: number;
  sort_order: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  duration_minutes: number;
  session_type: 'work' | 'break' | 'long_break';
  started_at: string;
  ended_at?: string;
  was_completed: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name?: string;
  timezone: string;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_before_long_break: number;
  weather_city: string;
  weather_units: 'metric' | 'imperial';
  created_at: string;
  updated_at: string;
}

export interface Quote {
  text: string;
  author: string;
}
