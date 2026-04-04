import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <span className="text-[160px] md:text-[200px] font-display font-bold text-surface-border/50 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-coral rounded-2xl flex items-center justify-center shadow-glow">
              <Search className="h-9 w-9 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-display-md font-display text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-body-lg text-muted mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 bg-gradient-to-r from-primary-400 to-accent-coral text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-11 px-6 border-2 border-surface-border text-foreground font-medium rounded-md hover:bg-surface-warm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
