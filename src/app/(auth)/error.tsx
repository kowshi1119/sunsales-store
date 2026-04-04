'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-5 bg-error-50 rounded-2xl flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-display-sm font-display text-foreground mb-2">Something went wrong</h2>
      <p className="text-body-md text-muted mb-6 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />}>Try Again</Button>
        <Link href="/">
          <Button variant="outline" leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
