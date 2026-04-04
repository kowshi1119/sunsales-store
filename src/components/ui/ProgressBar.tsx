'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantColors: Record<string, string> = {
  primary: 'bg-gradient-to-r from-primary-400 to-accent-coral',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-body-sm font-medium text-foreground">{label}</span>}
          {showLabel && <span className="text-body-xs text-muted">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full bg-surface-hover rounded-full overflow-hidden', sizeStyles[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-slow',
            variantColors[variant],
            animated && 'transition-[width]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
