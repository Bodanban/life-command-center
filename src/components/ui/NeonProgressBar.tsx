'use client';

import { cn } from '@/lib/utils/cn';

interface NeonProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function NeonProgressBar({
  value,
  className,
  showLabel = true,
  size = 'md',
}: NeonProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isComplete = clamped >= 100;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-xs text-cyber-text-dim">
            PROGRESSION
          </span>
          <span
            className={cn(
              'font-display text-xs font-bold',
              isComplete ? 'text-cyber-green text-glow-green' : 'text-cyber-blue'
            )}
          >
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-cyber-bg-deep/80',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-cyber-green to-cyber-blue shadow-neon-green'
              : 'bg-gradient-to-r from-cyber-blue to-cyber-purple'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
