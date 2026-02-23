import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  weatherCity: string;
  isSettingsOpen: boolean;

  setWeatherCity: (city: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetAllData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weatherCity: process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Paris',
      isSettingsOpen: false,

      setWeatherCity: (city) => set({ weatherCity: city }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      resetAllData: () => {
        const storeKeys = [
          'task-store',
          'pomodoro-store',
          'habit-store',
          'objective-store',
          'daily-score-store',
          'settings-store',
        ];
        storeKeys.forEach((key) => localStorage.removeItem(key));
        window.location.reload();
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        weatherCity: state.weatherCity,
      }),
    }
  )
);
