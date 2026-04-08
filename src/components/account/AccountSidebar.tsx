'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Heart, KeyRound, LayoutDashboard, LogOut, MapPin, Package, Palette, UserRound } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const accountLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/password', label: 'Password', icon: KeyRound },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/designs', label: 'Saved Designs', icon: Palette },
] as const;

interface AccountSidebarProps {
  name: string;
  email: string;
  avatar?: string | null;
}

export default function AccountSidebar({ name, email, avatar }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl border border-surface-border bg-white p-4 shadow-card">
      <div className="flex items-center gap-3 rounded-2xl bg-surface-warm/60 p-3">
        <Avatar src={avatar} name={name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-body-md font-semibold text-foreground">{name}</p>
          <p className="truncate text-body-xs text-muted">{email}</p>
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {accountLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/account' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-body-sm transition-colors',
                isActive
                  ? 'bg-primary-50 font-semibold text-primary-700'
                  : 'text-muted hover:bg-surface-warm hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-surface-border pt-4">
        <Button variant="outline" fullWidth leftIcon={<LogOut className="h-4 w-4" />} onClick={() => signOut({ callbackUrl: '/' })}>
          Log out
        </Button>
      </div>
    </aside>
  );
}
