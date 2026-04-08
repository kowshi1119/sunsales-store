'use client';

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, leftIcon, wrapperClassName, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-body-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-11 px-4 pr-10 rounded-md border bg-white text-body-md text-foreground appearance-none',
              'border-surface-border',
              'transition-all duration-fast',
              'hover:border-muted-light',
              'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
              'disabled:bg-surface-warm disabled:cursor-not-allowed disabled:opacity-60',
              error && 'border-error-500 focus:ring-error-500/30 focus:border-error-500',
              leftIcon && 'pl-10',
              !props.value && 'text-muted-light',
              className
            )}
            aria-describedby={describedBy}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-body-xs text-error-500" role="alert">{error}</p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-body-xs text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
