import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionType = 'work' | 'break' | 'long_break';

interface PomodoroState {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  sessionType: SessionType;
  completedSessions: number;
  startedAt: number | null;

  // Settings
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;

  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
}

function getSessionDuration(type: SessionType, state: PomodoroState): number {
  switch (type) {
    case 'work': return state.workMinutes * 60;
    case 'break': return state.breakMinutes * 60;
    case 'long_break': return state.longBreakMinutes * 60;
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      timeRemaining: 25 * 60,
      totalTime: 25 * 60,
      isRunning: false,
      sessionType: 'work',
      completedSessions: 0,
      startedAt: null,

      workMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,

      start: () => {
        set({ isRunning: true, startedAt: Date.now() });
      },

      pause: () => {
        const state = get();
        if (state.startedAt) {
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          const remaining = Math.max(0, state.timeRemaining - elapsed);
          set({ isRunning: false, timeRemaining: remaining, startedAt: null });
        }
      },

      resume: () => {
        set({ isRunning: true, startedAt: Date.now() });
      },

      reset: () => {
        const state = get();
        const duration = getSessionDuration(state.sessionType, state);
        set({
          timeRemaining: duration,
          totalTime: duration,
          isRunning: false,
          startedAt: null,
        });
      },

      skip: () => {
        const state = get();
        let nextType: SessionType;
        let sessions = state.completedSessions;

        if (state.sessionType === 'work') {
          sessions += 1;
          nextType = sessions % state.sessionsBeforeLongBreak === 0 ? 'long_break' : 'break';
        } else {
          nextType = 'work';
        }

        const duration = getSessionDuration(nextType, { ...state, completedSessions: sessions });
        set({
          sessionType: nextType,
          completedSessions: sessions,
          timeRemaining: duration,
          totalTime: duration,
          isRunning: false,
          startedAt: null,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning || !state.startedAt) return;

        const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
        const remaining = Math.max(0, state.timeRemaining - elapsed);

        if (remaining <= 0) {
          // Session complete — auto-skip
          state.skip();
          // Play cyberpunk notification sound via Web Audio API
          try {
            const ctx = new AudioContext();
            const playTone = (freq: number, startTime: number, duration: number) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, startTime);
              gain.gain.setValueAtTime(0, startTime);
              gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
              gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
              osc.start(startTime);
              osc.stop(startTime + duration);
            };
            const now = ctx.currentTime;
            playTone(880, now, 0.15);
            playTone(1100, now + 0.18, 0.15);
            playTone(1320, now + 0.36, 0.3);
          } catch {}
          // Vibrate on mobile
          try { navigator.vibrate?.([200, 100, 200]); } catch {}
        }
      },
    }),
    {
      name: 'pomodoro-store',
      partialize: (state) => ({
        completedSessions: state.completedSessions,
        workMinutes: state.workMinutes,
        breakMinutes: state.breakMinutes,
        longBreakMinutes: state.longBreakMinutes,
        sessionsBeforeLongBreak: state.sessionsBeforeLongBreak,
      }),
    }
  )
);
