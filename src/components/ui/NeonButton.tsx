'use client';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'blue' | 'green' | 'purple' | 'red' | 'ghost';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  blue: 'border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-neon-blue active:bg-cyber-blue/20',
  green: 'border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 hover:shadow-neon-green active:bg-cyber-green/20',
  purple: 'border-cyber-purple/50 text-cyber-purple hover:bg-cyber-purple/10 hover:shadow-neon-purple active:bg-cyber-purple/20',
  red: 'border-cyber-red/50 text-cyber-red hover:bg-cyber-red/10 hover:shadow-neon-red active:bg-cyber-red/20',
  ghost: 'border-transparent text-cyber-text-dim hover:text-cyber-text hover:bg-white/5',
};

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function NeonButton({
  variant = 'blue',
  size = 'md',
  className,
  children,
  ...props
}: NeonButtonProps) {
  return (
    <button
      className={cn(
        'font-mono font-medium rounded-lg border transition-all duration-200 uppercase tracking-wider',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
