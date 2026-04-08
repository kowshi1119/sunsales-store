'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  ShoppingCart,
  Smartphone,
  Star,
  SunMedium,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { getInitials, cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/phone-models', label: 'Phone Models', icon: Smartphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
] as const;

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Sun Sales Team';
  const userRole = session?.user?.role || 'ADMIN';
  const initials = getInitials(userName);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/40 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 transition-transform duration-300 md:sticky md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed && 'md:w-24'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-coral text-slate-950 shadow-lg">
              <SunMedium className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-semibold text-white">Sun Sales</p>
                <p className="text-xs text-slate-400">Admin Console</p>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:inline-flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'border-primary-400/40 bg-primary-400/15 text-white shadow-sm'
                    : 'border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900 hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className={cn('rounded-2xl bg-slate-900 p-3', isCollapsed && 'px-2')}>
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{userName}</p>
                  <Badge variant="primary" size="sm">{userRole.replace(/_/g, ' ')}</Badge>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  fullWidth
                  className="justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
