'use client';

import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: 'blue' | 'green' | 'purple';
}

const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  ({ accent = 'blue', className, ...props }, ref) => {
    const accentColors = {
      blue: 'focus:border-cyber-blue/60 focus:shadow-neon-blue',
      green: 'focus:border-cyber-green/60 focus:shadow-neon-green',
      purple: 'focus:border-cyber-purple/60 focus:shadow-neon-purple',
    };

    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-cyber-bg-deep/60 border border-white/10 rounded-lg px-3 py-2',
          'font-mono text-sm text-cyber-text placeholder:text-cyber-text-dim/50',
          'outline-none transition-all duration-200',
          accentColors[accent],
          className
        )}
        {...props}
      />
    );
  }
);

NeonInput.displayName = 'NeonInput';

export default NeonInput;
