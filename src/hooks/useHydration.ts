'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to safely use Zustand persisted stores in Next.js.
 * Returns false during SSR and first client render,
 * true after hydration is complete.
 * 
 * Usage:
 *   const hydrated = useHydration();
 *   const count = useCartStore((s) => s.getItemCount());
 *   // Show count only after hydration to avoid mismatch
 *   {hydrated && count > 0 && <Badge>{count}</Badge>}
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Wrapper to safely use a Zustand store value only after hydration.
 * Returns the fallback value during SSR, then the real value after mount.
 */
export function useStoreHydrated<T>(selector: () => T, fallback: T): T {
  const hydrated = useHydration();
  const value = selector();
  return hydrated ? value : fallback;
}
