'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const TRENDING_SEARCHES = [
  'Phone covers',
  'Photo frames',
  'Gift sets',
  'Personalized gifts',
  'Birthday gifts',
];

export default function SearchBar() {
  const router = useRouter();
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen, closeSearch]);

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    closeSearch();
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeSearch} />

      {/* Search Panel */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-[10vh] px-4 animate-fade-down">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <h2 id={titleId} className="sr-only">Site search</h2>

          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 border-b border-surface-border">
            <Search className="h-5 w-5 text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, categories, or brands..."
              className="flex-1 h-14 bg-transparent text-body-lg text-foreground placeholder:text-muted-light focus:outline-none"
              autoComplete="off"
              aria-label="Search products, categories, or brands"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="ml-1 px-3 py-1.5 text-body-xs font-medium text-muted bg-surface-warm rounded-md hover:bg-surface-hover transition-colors"
              aria-label="Close search"
            >
              ESC
            </button>
          </div>

          {/* Search body */}
          <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
            {!query ? (
              /* Trending searches */
              <div>
                <p className="text-body-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Trending Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSearch(term)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-warm text-body-sm text-foreground rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {term}
                      <ArrowRight className="h-3 w-3 text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Search suggestion hint */
              <div className="flex items-center gap-2 text-body-sm text-muted py-2">
                <Search className="h-4 w-4" />
                <span>
                  Press <kbd className="px-1.5 py-0.5 bg-surface-warm rounded text-body-xs font-mono">Enter</kbd> to search for &ldquo;{query}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
