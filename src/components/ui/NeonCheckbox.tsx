'use client';

import { cn } from '@/lib/utils/cn';

interface NeonCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  strikethrough?: boolean;
}

export default function NeonCheckbox({
  checked,
  onChange,
  label,
  className,
  strikethrough = true,
}: NeonCheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer group',
        className
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
          checked
            ? 'border-cyber-green bg-cyber-green/20 shadow-neon-green'
            : 'border-cyber-text-dim/40 hover:border-cyber-blue/60'
        )}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-cyber-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {label && (
        <span
          className={cn(
            'text-sm font-mono transition-all duration-200',
            checked && strikethrough
              ? 'line-through text-cyber-text-dim/50'
              : 'text-cyber-text group-hover:text-white'
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
