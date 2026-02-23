'use client';

import { useEffect, useState } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { useRoutineStore } from '@/stores/useRoutineStore';

interface RoutineWidgetProps {
  type: 'morning' | 'bedtime';
}

const config = {
  morning: {
    title: 'Routine Matin',
    icon: '🌅',
    accent: 'green' as const,
    activeStart: 5,
    activeEnd: 9,
    summaryLabel: 'Routine matin',
  },
  bedtime: {
    title: 'Routine Soir',
    icon: '🌙',
    accent: 'purple' as const,
    activeStart: 21,
    activeEnd: 24,
    summaryLabel: 'Routine soir',
  },
};

export default function RoutineWidget({ type }: RoutineWidgetProps) {
  const { toggleStep, isStepCompleted, getActiveStepsForToday, getCompletionRate } = useRoutineStore();
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  const cfg = config[type];
  const activeSteps = getActiveStepsForToday(type);
  const rate = getCompletionRate(type);
  const completedCount = activeSteps.filter(({ index }) => isStepCompleted(type, index)).length;

  const isActiveTime = hour >= cfg.activeStart && hour < cfg.activeEnd;

  return (
    <WidgetPanel accent={cfg.accent} title={cfg.title} icon={cfg.icon} className="h-full">
      <div className="flex flex-col h-full gap-2">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${rate}%`,
                backgroundColor: rate === 100 ? '#00ff88' : type === 'morning' ? '#00ff8880' : '#b400ff80',
                boxShadow: rate > 0 ? `0 0 6px ${rate === 100 ? '#00ff8840' : type === 'morning' ? '#00ff8830' : '#b400ff30'}` : 'none',
              }}
            />
          </div>
          <span className="font-mono text-[9px] text-cyber-text-dim/60 flex-shrink-0">
            {completedCount}/{activeSteps.length}
          </span>
        </div>

        {isActiveTime ? (
          /* Active: full checklist */
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {activeSteps.map(({ step, index, detail }) => {
              const done = isStepCompleted(type, index);
              return (
                <button
                  key={index}
                  onClick={() => toggleStep(type, index)}
                  className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-all touch-manipulation ${
                    done
                      ? 'opacity-50 bg-white/[0.02]'
                      : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border flex items-center justify-center text-[10px] transition-all ${
                    done
                      ? 'bg-cyber-green/20 border-cyber-green/50 text-cyber-green'
                      : 'border-white/20'
                  }`}>
                    {done ? '✓' : ''}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-[10px] leading-tight ${
                      done ? 'line-through text-cyber-text-dim/50' : 'text-cyber-text'
                    }`}>
                      {step.name}
                    </p>
                    {detail !== '-' && detail !== step.name && detail !== 'Eau' && detail !== 'Hygiene' && detail !== 'Priere' && detail !== 'Tenue' && detail !== 'Lecture' && (
                      <p className="font-mono text-[8px] text-cyber-text-dim/40 mt-0.5 truncate">
                        {detail}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Inactive: compact summary */
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">{cfg.icon}</span>
            <p className="font-mono text-[10px] text-cyber-text-dim text-center">
              {rate === 100 ? (
                <span className="text-cyber-green">
                  {cfg.summaryLabel} : {completedCount}/{activeSteps.length} ✓
                </span>
              ) : hour < cfg.activeStart ? (
                <span>
                  {cfg.summaryLabel} a {cfg.activeStart}h
                </span>
              ) : (
                <span>
                  {cfg.summaryLabel} : {completedCount}/{activeSteps.length}
                </span>
              )}
            </p>
            {rate > 0 && rate < 100 && (
              <p className="font-mono text-[8px] text-cyber-text-dim/40">
                {rate}% complete
              </p>
            )}
          </div>
        )}
      </div>
    </WidgetPanel>
  );
}
