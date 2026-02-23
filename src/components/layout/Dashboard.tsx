'use client';

import { useEffect } from 'react';
import ClockWidget from '@/components/widgets/clock/ClockWidget';
import DailyObjectivesWidget from '@/components/widgets/daily-objectives/DailyObjectivesWidget';
import PomodoroWidget from '@/components/widgets/pomodoro/PomodoroWidget';
import TaskListWidget from '@/components/widgets/tasks/TaskListWidget';
import HabitTrackerWidget from '@/components/widgets/habits/HabitTrackerWidget';
import RoutineWidget from '@/components/widgets/routines/RoutineWidget';
import StatsWidget from '@/components/widgets/stats/StatsWidget';
import BurnInPrevention from '@/components/effects/BurnInPrevention';
import ScreenDimmer from '@/components/effects/ScreenDimmer';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Dashboard() {
  const { isSettingsOpen, openSettings } = useSettingsStore();

  // Wake Lock: keep screen on (for always-on tablet display)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {}
    };

    requestWakeLock();

    // Re-acquire on visibility change (when user returns to app)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  return (
    <>
      <ScreenDimmer />
      {isSettingsOpen && <SettingsPanel />}
      <BurnInPrevention>
        <div className="h-screen w-screen p-2 overflow-hidden">
          {/* Settings gear button */}
          <button
            onClick={openSettings}
            className="fixed top-2 right-2 z-[100] w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-cyber-text-dim/40 hover:text-cyber-blue hover:border-cyber-blue/30 transition-all text-sm"
          >
            ⚙
          </button>
          {/*
            Grid Layout:
            +---------------------+------------------+-------------------+
            |  Daily Objectives   |  Pomodoro Timer  |  Clock + Progress |
            |  (row-span-2)       |  (row-span-2)    |                   |
            |                     |                  +-------------------+
            |                     |                  |  Routine Matin    |
            +---------------------+------------------+-------------------+
            |  Task List          |  Stats & Analytics                   |
            |  (row-span-2)       |  (col-span-2)                       |
            |                     +------------------+-------------------+
            |                     |  Habit Tracker   |  Routine Soir     |
            +---------------------+------------------+-------------------+
          */}
          <div className="grid grid-cols-3 grid-rows-4 gap-2 h-full [&>div]:min-h-0">
            {/* Row 1-2, Col 1: Daily Objectives */}
            <div className="row-span-2 h-full">
              <DailyObjectivesWidget />
            </div>

            {/* Row 1-2, Col 2: Pomodoro Timer */}
            <div className="row-span-2 h-full">
              <PomodoroWidget />
            </div>

            {/* Row 1, Col 3: Clock + Day Progress */}
            <div className="h-full">
              <ClockWidget />
            </div>

            {/* Row 2, Col 3: Morning Routine */}
            <div className="h-full">
              <RoutineWidget type="morning" />
            </div>

            {/* Row 3-4, Col 1: Task List */}
            <div className="row-span-2 h-full">
              <TaskListWidget />
            </div>

            {/* Row 3, Col 2-3: Stats */}
            <div className="col-span-2 h-full">
              <StatsWidget />
            </div>

            {/* Row 4, Col 2: Habit Tracker */}
            <div className="h-full">
              <HabitTrackerWidget />
            </div>

            {/* Row 4, Col 3: Bedtime Routine */}
            <div className="h-full">
              <RoutineWidget type="bedtime" />
            </div>
          </div>
        </div>
      </BurnInPrevention>
    </>
  );
}
