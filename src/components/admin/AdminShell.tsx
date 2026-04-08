'use client';

import { useState, type ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

interface AdminShellProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function AdminShell({ title, description, children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
        />

        <div className="min-w-0 flex-1">
          <AdminTopbar
            title={title}
            description={description}
            onMenuClick={() => setIsSidebarOpen((value) => !value)}
          />

          <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
