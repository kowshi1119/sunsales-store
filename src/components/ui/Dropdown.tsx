'use client';

import { useState, useRef, useEffect, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  contentClassName?: string;
}

export default function Dropdown({ trigger, children, align = 'left', className, contentClassName }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev: boolean) => !prev)}
        className="cursor-pointer appearance-none border-0 bg-transparent p-0"
        aria-haspopup="true"
        aria-controls={isOpen ? menuId : undefined}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          id={menuId}
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] bg-white rounded-lg shadow-lg border border-surface-border py-1 animate-fade-down',
            align === 'right' ? 'right-0' : 'left-0',
            contentClassName
          )}
          aria-label="Dropdown panel"
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownItem({ children, onClick, icon, danger, disabled, className }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-body-sm text-left transition-colors',
        danger
          ? 'text-error-600 hover:bg-error-50'
          : 'text-foreground hover:bg-surface-warm',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="flex-shrink-0 text-muted">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-surface-border" aria-hidden="true" />;
}
