'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  dismissible?: boolean;
  className?: string;
}

export default function AnnouncementBar({
  message,
  linkText,
  linkHref,
  dismissible = true,
  className,
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-center py-2 px-4 text-body-xs font-medium relative',
        className
      )}
      role="banner"
    >
      <p className="pr-6">
        ✨ {message}
        {linkText && linkHref && (
          <>
            {' '}
            <Link
              href={linkHref}
              className="underline underline-offset-2 hover:text-primary-200 transition-colors font-semibold"
            >
              {linkText}
            </Link>
          </>
        )}
      </p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
