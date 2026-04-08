'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ChevronRight, LogOut, Menu, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Skeleton';
import { getInitials } from '@/lib/utils';

interface AdminTopbarProps {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export default function AdminTopbar({ title, description, onMenuClick }: AdminTopbarProps) {
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name || 'Sun Sales');

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Admin</span>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate text-primary-600">{title}</span>
            </div>
            <h1 className="truncate text-xl font-semibold text-slate-950 md:text-2xl">{title}</h1>
            <p className="mt-1 hidden max-w-2xl text-sm text-slate-600 md:block">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="hidden md:block">
            <Button variant="outline" size="sm" leftIcon={<Store className="h-4 w-4" />}>
              View store
            </Button>
          </Link>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{session?.user?.name || 'Sun Sales Team'}</p>
              <Badge variant="outline">{(session?.user?.role || 'ADMIN').replace(/_/g, ' ')}</Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-slate-700"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
