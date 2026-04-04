'use client';

import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

// ============ SKELETON ============
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  const roundedMap = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' };
  return (
    <div
      className={cn('skeleton', roundedMap[rounded], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface-card rounded-lg overflow-hidden', className)} aria-hidden="true">
      <Skeleton className="w-full aspect-square" rounded="sm" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8" rounded="full" />
        </div>
      </div>
    </div>
  );
}

// ============ SPINNER ============
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <Loader2
      className={cn('animate-spin text-primary-400', sizeMap[size], className)}
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-body-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

// ============ BADGE ============
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-surface-warm text-muted',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  outline: 'bg-transparent border border-surface-border text-muted',
};

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-body-xs' : 'px-3 py-1 text-body-sm',
        badgeVariants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', {
          'bg-muted': variant === 'default' || variant === 'outline',
          'bg-primary-500': variant === 'primary',
          'bg-success-500': variant === 'success',
          'bg-warning-500': variant === 'warning',
          'bg-error-500': variant === 'error',
        })} />
      )}
      {children}
    </span>
  );
}

// ============ EMPTY STATE ============
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface-warm flex items-center justify-center mb-5">
          <Icon className="h-7 w-7 text-muted-light" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-display-sm font-display text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-body-md text-muted max-w-md mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
