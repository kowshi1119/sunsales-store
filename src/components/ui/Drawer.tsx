'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
  showClose?: boolean;
  width?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = 'right',
  className,
  showClose = true,
  width,
}: DrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideStyles = {
    left: 'left-0 top-0 h-full animate-slide-in-left',
    right: 'right-0 top-0 h-full animate-slide-in-right',
    bottom: 'bottom-0 left-0 w-full animate-slide-up rounded-t-2xl max-h-[85vh]',
  };

  const defaultWidth = side === 'bottom' ? '' : 'w-full max-w-md';

  const drawer = (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute bg-white shadow-xl flex flex-col overflow-hidden',
          sideStyles[side],
          width || defaultWidth,
          className
        )}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border flex-shrink-0">
            {title && (
              <h2 id={titleId} className="font-display text-lg font-bold text-foreground">{title}</h2>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors ml-auto"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawer, document.body);
  }
  return null;
}
