import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderTree, ShoppingCart, Sparkles } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import DashboardCards from '@/components/admin/DashboardCards';
import RecentOrders from '@/components/admin/RecentOrders';
import SalesChart from '@/components/admin/SalesChart';
import Button from '@/components/ui/Button';
import { getDashboardSnapshot } from '@/lib/admin';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Admin Dashboard',
  description: 'Overview of Sun Sales operations, orders, catalog health, and customer activity.',
  url: '/admin',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const dashboard = await getDashboardSnapshot();

  return (
    <AdminShell
      title="Operations dashboard"
      description="Monitor revenue, order flow, customer activity, and production queues from a single workspace."
    >
      <DashboardCards stats={dashboard.stats} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <SalesChart data={dashboard.revenue} />

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-primary-600">Quick actions</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Stay ahead of today’s workload</h2>
            <p className="mt-1 text-sm text-slate-600">
              Open the most important queues directly from the dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Pending orders</p>
                  <p className="text-sm text-slate-600">{dashboard.stats.pendingOrders} orders are waiting for updates.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Design reviews</p>
                  <p className="text-sm text-slate-600">{dashboard.stats.pendingDesigns} saved designs need attention.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Catalog health</p>
                  <p className="text-sm text-slate-600">{dashboard.stats.totalProducts} active products are currently live.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/orders">
              <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>Review orders</Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" fullWidth>Manage catalog</Button>
            </Link>
          </div>
        </section>
      </div>

      <RecentOrders orders={dashboard.recentOrders} />
    </AdminShell>
  );
}
