'use client';

import { useEffect } from 'react';
import Link from 'next/link';
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
      <p className="text-body-md text-muted mb-6 max-w-md">An unexpected error occurred. Please try again.</p>
      <div className="flex items-center gap-3">
        <button onClick={reset} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-400 to-accent-coral text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          Try Again
        </button>
        <a href="/" className="inline-flex items-center gap-2 h-10 px-5 border-2 border-surface-border text-foreground font-medium rounded-md hover:bg-surface-warm transition-all">
          Go Home
        </a>
      </div>
    </div>
  );
}
