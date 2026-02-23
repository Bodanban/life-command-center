'use client';

import { useEffect } from 'react';
import ClockWidget from '@/components/widgets/clock/ClockWidget';
import DailyObjectivesWidget from '@/components/widgets/daily-objectives/DailyObjectivesWidget';
import PomodoroWidget from '@/components/widgets/pomodoro/PomodoroWidget';
import TaskListWidget from '@/components/widgets/tasks/TaskListWidget';
import HabitTrackerWidget from '@/components/widgets/habits/HabitTrackerWidget';
import WeatherWidget from '@/components/widgets/weather/WeatherWidget';
import QuoteWidget from '@/components/widgets/quotes/QuoteWidget';
import StatsWidget from '@/components/widgets/stats/StatsWidget';
import BurnInPrevention from '@/components/effects/BurnInPrevention';
import ScreenDimmer from '@/components/effects/ScreenDimmer';

export default function Dashboard() {
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
      <BurnInPrevention>
        <div className="h-screen w-screen p-2 overflow-hidden">
          {/*
            Grid Layout:
            +---------------------+------------------+-------------------+
            |  Daily Objectives   |  Pomodoro Timer  |  Clock & Date     |
            |  (row-span-2)       |  (row-span-2)    |                   |
            |                     |                  +-------------------+
            |                     |                  |  Weather          |
            +---------------------+------------------+-------------------+
            |  Task List          |  Stats & Analytics                   |
            |  (row-span-2)       |  (col-span-2)                       |
            |                     +------------------+-------------------+
            |                     |  Habit Tracker   |  Quote            |
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

            {/* Row 1, Col 3: Clock */}
            <div className="h-full">
              <ClockWidget />
            </div>

            {/* Row 2, Col 3: Weather */}
            <div className="h-full">
              <WeatherWidget />
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

            {/* Row 4, Col 3: Quote */}
            <div className="h-full">
              <QuoteWidget />
            </div>
          </div>
        </div>
      </BurnInPrevention>
    </>
  );
}
