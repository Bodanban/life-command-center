'use client';

import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'blue' | 'green' | 'purple' | 'red' | 'yellow';

interface NeonBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'border-cyber-blue/40 text-cyber-blue bg-cyber-blue/10',
  green: 'border-cyber-green/40 text-cyber-green bg-cyber-green/10',
  purple: 'border-cyber-purple/40 text-cyber-purple bg-cyber-purple/10',
  red: 'border-cyber-red/40 text-cyber-red bg-cyber-red/10',
  yellow: 'border-cyber-yellow/40 text-cyber-yellow bg-cyber-yellow/10',
};

export default function NeonBadge({
  variant = 'blue',
  children,
  className,
}: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
