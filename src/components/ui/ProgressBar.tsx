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

function getProgressWidthClass(percentage: number) {
  if (percentage >= 100) return 'w-full';
  if (percentage >= 95) return 'w-[95%]';
  if (percentage >= 90) return 'w-[90%]';
  if (percentage >= 80) return 'w-[80%]';
  if (percentage >= 75) return 'w-3/4';
  if (percentage >= 70) return 'w-[70%]';
  if (percentage >= 60) return 'w-3/5';
  if (percentage >= 50) return 'w-1/2';
  if (percentage >= 40) return 'w-2/5';
  if (percentage >= 30) return 'w-[30%]';
  if (percentage >= 25) return 'w-1/4';
  if (percentage >= 20) return 'w-1/5';
  if (percentage >= 10) return 'w-[10%]';
  if (percentage > 0) return 'w-[5%]';
  return 'w-0';
}

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
        className={cn('w-full overflow-hidden rounded-full bg-surface-hover', sizeStyles[size])}
        role="progressbar"
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-slow',
            getProgressWidthClass(percentage),
            variantColors[variant],
            animated && 'transition-[width]'
          )}
        />
      </div>
    </div>
  );
}
