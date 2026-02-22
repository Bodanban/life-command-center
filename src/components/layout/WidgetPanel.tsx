'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow';

interface WidgetPanelProps {
  children: React.ReactNode;
  accent?: AccentColor;
  className?: string;
  title?: string;
  icon?: string;
  expandable?: boolean;
}

const accentClasses: Record<AccentColor, string> = {
  blue: 'widget-accent-blue',
  green: 'widget-accent-green',
  purple: 'widget-accent-purple',
  red: 'widget-accent-red',
  yellow: 'widget-accent-yellow',
};

const accentColors: Record<AccentColor, string> = {
  blue: '#00d4ff',
  green: '#00ff88',
  purple: '#b400ff',
  red: '#ff0040',
  yellow: '#ffd700',
};

export default function WidgetPanel({
  children,
  accent = 'blue',
  className,
  title,
  icon,
  expandable = true,
}: WidgetPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const lastTapRef = useRef(0);

  const handleDoubleTap = useCallback(() => {
    if (!expandable) return;
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setExpanded(true);
    }
    lastTapRef.current = now;
  }, [expandable]);

  const handleClose = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setExpanded(false);
  }, []);

  return (
    <>
      {/* Normal widget in grid */}
      <div
        onClick={handleDoubleTap}
        className={cn(
          'glass-panel flex flex-col animate-float touch-manipulation',
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
            {expandable && (
              <span className="ml-auto text-[8px] text-cyber-text-dim/30 font-mono">⤢</span>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden p-3">{children}</div>
      </div>

      {/* Expanded fullscreen overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-expand-backdrop"
          style={{ background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={handleClose}
        >
          <div
            className={cn(
              'glass-panel flex flex-col w-[90vw] h-[85vh] animate-expand-in',
              accentClasses[accent],
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Expanded header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.08]">
              {icon && <span className="text-lg">{icon}</span>}
              <h2
                className="font-display text-sm font-bold uppercase tracking-[0.25em]"
                style={{ color: accentColors[accent] }}
              >
                {title || 'Widget'}
              </h2>
              <button
                onClick={handleClose}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-cyber-text-dim hover:text-cyber-red hover:border-cyber-red/40 transition-all text-sm font-mono"
              >
                ✕
              </button>
            </div>
            {/* Expanded content - more padding, scrollable */}
            <div className="flex-1 overflow-auto p-5">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
