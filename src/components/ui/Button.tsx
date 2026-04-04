'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-400 to-accent-coral text-white shadow-md hover:shadow-lg hover:shadow-primary-400/20 active:scale-[0.97] disabled:from-primary-200 disabled:to-primary-200 disabled:shadow-none',
  secondary:
    'bg-secondary-500 text-white shadow-md hover:bg-secondary-600 active:scale-[0.97] disabled:bg-secondary-200',
  outline:
    'border-2 border-surface-border text-foreground bg-transparent hover:bg-surface-warm hover:border-primary-300 active:scale-[0.97] disabled:border-surface-border disabled:text-muted-light',
  ghost:
    'text-foreground bg-transparent hover:bg-surface-warm active:bg-surface-hover disabled:text-muted-light',
  danger:
    'bg-error-500 text-white shadow-md hover:bg-error-600 active:scale-[0.97] disabled:bg-error-500/50',
  success:
    'bg-success-500 text-white shadow-md hover:bg-success-600 active:scale-[0.97] disabled:bg-success-500/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm rounded-sm gap-1.5',
  md: 'h-10 px-5 text-body-md rounded-md gap-2',
  lg: 'h-12 px-7 text-body-lg rounded-md gap-2.5',
  xl: 'h-14 px-9 text-body-lg rounded-lg gap-3 font-semibold',
  icon: 'h-10 w-10 rounded-md flex items-center justify-center p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-normal',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
            {!loadingText && children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
