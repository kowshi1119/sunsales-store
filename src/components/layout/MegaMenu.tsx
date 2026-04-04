'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown, Smartphone, Frame, Gift, Sparkles } from 'lucide-react';

interface MegaMenuCategory {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
  featured?: boolean;
}

const SHOP_CATEGORIES: MegaMenuCategory[] = [
  { name: 'All Products', href: '/shop', icon: Sparkles, description: 'Browse our full collection' },
  { name: 'Gift Items', href: '/category/gifts', icon: Gift, description: 'Premium gifts for every occasion' },
  { name: 'Phone Covers', href: '/category/phone-covers', icon: Smartphone, description: 'Custom & designer phone covers', featured: true },
  { name: 'Photo Frames', href: '/category/photo-frames', icon: Frame, description: 'Personalized photo frames', featured: true },
];

interface MegaMenuProps {
  className?: string;
}

export default function MegaMenu({ className }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center gap-1 px-3 py-2 text-body-sm font-medium text-muted hover:text-foreground rounded-md transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Shop
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[400px] bg-white rounded-xl shadow-lg border border-surface-border p-4 animate-fade-down z-50">
          <div className="grid gap-1">
            {SHOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-warm transition-colors group"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  cat.featured
                    ? 'bg-gradient-to-br from-primary-400 to-accent-coral text-white'
                    : 'bg-surface-warm text-muted group-hover:bg-primary-50 group-hover:text-primary-600'
                )}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-body-xs text-muted">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
