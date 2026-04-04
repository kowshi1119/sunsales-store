'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

// ============ TOOLTIP ============
interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 bg-foreground text-white text-body-xs rounded-md whitespace-nowrap pointer-events-none animate-fade-in shadow-lg',
            positionStyles[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ============ PROGRESS BAR ============
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-400 to-accent-coral',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-body-xs font-medium text-foreground">Progress</span>
          <span className="text-body-xs text-muted">{Math.round(percentage)}%</span>
        </div>
      )}
      <progress
        value={percentage}
        max={100}
        className="sr-only"
        aria-label={`Progress: ${Math.round(percentage)}%`}
      >
        {Math.round(percentage)}%
      </progress>
      <div className={cn('w-full bg-surface-warm rounded-full overflow-hidden', sizeStyles[size])} aria-hidden="true">
        <div
          className={cn('h-full rounded-full transition-all duration-slow ease-smooth', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============ AVATAR ============
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-body-xs',
    md: 'w-10 h-10 text-body-sm',
    lg: 'w-12 h-12 text-body-md',
    xl: 'w-16 h-16 text-body-lg',
  };
  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
        unoptimized={src.startsWith('/images/')}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary-200 to-accent-cream flex items-center justify-center font-bold text-primary-700',
        sizeStyles[size],
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
