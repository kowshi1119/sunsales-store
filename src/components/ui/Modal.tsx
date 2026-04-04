'use client';

import { useEffect, useCallback, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[90vw] max-h-[90vh]',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      {/* Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl shadow-xl animate-scale-in overflow-hidden',
          sizeStyles[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
            <div>
              {title && (
                <h2 id={titleId} className="text-display-sm font-display text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-body-sm text-muted mt-1">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex-shrink-0 ml-4 p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-warm transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {/* Body */}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}
