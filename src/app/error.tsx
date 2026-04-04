'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-error-50 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-display-md font-display text-foreground mb-3">Something Went Wrong</h1>
        <p className="text-body-lg text-muted mb-8">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-6 bg-gradient-to-r from-primary-400 to-accent-coral text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 border-2 border-surface-border text-foreground font-medium rounded-md hover:bg-surface-warm transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
