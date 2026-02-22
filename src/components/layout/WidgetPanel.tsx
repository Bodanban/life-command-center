'use client';

import { cn } from '@/lib/utils/cn';

type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow';

interface WidgetPanelProps {
  children: React.ReactNode;
  accent?: AccentColor;
  className?: string;
  title?: string;
  icon?: string;
}

const accentClasses: Record<AccentColor, string> = {
  blue: 'widget-accent-blue',
  green: 'widget-accent-green',
  purple: 'widget-accent-purple',
  red: 'widget-accent-red',
  yellow: 'widget-accent-yellow',
};

export default function WidgetPanel({
  children,
  accent = 'blue',
  className,
  title,
  icon,
}: WidgetPanelProps) {
  return (
    <div
      className={cn(
        'glass-panel flex flex-col animate-float',
        accentClasses[accent],
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06]">
          {icon && <span className="text-xs">{icon}</span>}
          <h2 className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-cyber-text-dim">
            {title}
          </h2>
        </div>
      )}
      <div className="flex-1 overflow-hidden p-3">{children}</div>
    </div>
  );
}
