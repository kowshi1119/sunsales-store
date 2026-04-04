'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useHydration } from '@/hooks/useHydration';

type MobileNavAction = 'search' | 'cart';

interface MobileNavTab {
  icon: typeof Home;
  label: string;
  href: string;
  action?: MobileNavAction;
}

const tabs: MobileNavTab[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Search', href: '/search', action: 'search' },
  { icon: ShoppingBag, label: 'Cart', href: '/cart', action: 'cart' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: User, label: 'Account', href: '/login' },
];

/** Fixed bottom navigation bar — visible only on mobile */
export default function MobileNav() {
  const pathname = usePathname();
  const hydrated = useHydration();
  const cartCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const openSearch = useUIStore((s) => s.openSearch);

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border pb-safe md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          const handleClick = (e: React.MouseEvent) => {
            if (tab.action === 'cart') {
              e.preventDefault();
              openCart();
            } else if (tab.action === 'search') {
              e.preventDefault();
              openSearch();
            }
          };

          return (
            <Link
              key={tab.label}
              href={tab.href}
              onClick={handleClick}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive ? 'text-primary-600' : 'text-muted'
              )}
              aria-label={tab.label}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {tab.action === 'cart' && hydrated && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center bg-primary-400 text-white text-[9px] font-bold rounded-full px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
