'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useHydration } from '@/hooks/useHydration';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Phone,
} from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const hydrated = useHydration();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, openSearch } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-center py-2 px-4 text-body-xs font-medium">
        <p>✨ Free shipping on orders over Rs. 5,000 | <Link href="/shop" className="underline underline-offset-2 hover:text-primary-200 transition-colors">Shop Now</Link></p>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-normal',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-surface-border/50'
            : 'bg-white'
        )}
      >
        <div className="container-base">
          <div className="flex items-center justify-between h-[var(--header-height-mobile)] md:h-[var(--header-height)]">
            {/* Left: Menu Toggle (Mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 -ml-2 text-foreground hover:bg-surface-warm rounded-md transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link href="/" className="flex items-center gap-2 group" aria-label="Sun Sales Home">
                <div className="relative w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-coral rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
                  <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-display text-lg font-bold text-foreground leading-tight tracking-tight">
                    Sun Sales
                  </span>
                  <span className="text-[10px] text-muted font-medium uppercase tracking-wider -mt-0.5">
                    Premium Gifts
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-body-sm font-medium rounded-md transition-colors',
                    pathname === link.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-muted hover:text-foreground hover:bg-surface-warm'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={openSearch}
                className="p-2.5 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                href="/wishlist"
                className="hidden sm:flex p-2.5 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <Link
                href="/login"
                className="hidden sm:flex p-2.5 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2.5 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                {hydrated && cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary-400 text-white text-[10px] font-bold rounded-full px-1 animate-scale-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobileMenu} />
          <nav className="absolute top-0 left-0 w-[85%] max-w-xs h-full bg-white shadow-xl animate-slide-in-left overflow-y-auto pb-safe">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-coral rounded-lg flex items-center justify-center">
                  <Sun className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold">Sun Sales</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-muted hover:text-foreground"
                aria-label="Close mobile menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg text-body-md font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-foreground hover:bg-surface-warm'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile secondary links */}
            <div className="border-t border-surface-border mx-4" />
            <div className="p-4 space-y-1">
              <Link href="/login" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-md text-foreground hover:bg-surface-warm transition-colors">
                <User className="h-5 w-5 text-muted" /> My Account
              </Link>
              <Link href="/wishlist" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-md text-foreground hover:bg-surface-warm transition-colors">
                <Heart className="h-5 w-5 text-muted" /> Wishlist
              </Link>
            </div>

            {/* Contact info */}
            <div className="mt-auto p-5 border-t border-surface-border">
              <div className="flex items-center gap-2 text-body-sm text-muted">
                <Phone className="h-4 w-4" />
                <span>Need help? Call us at +94 77 123 4567</span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
