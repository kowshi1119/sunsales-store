import { AlertCircle, Layers3, ShoppingCart, Sparkles, Users } from 'lucide-react';
import type { DashboardStats } from '@/types/admin';
import { formatCompactNumber, formatPrice } from '@/lib/formatters';

interface DashboardCardsProps {
  stats: DashboardStats;
}

const cardConfig = [
  {
    key: 'todayRevenue',
    label: "Today's Revenue",
    helper: 'Confirmed sales captured today',
    icon: Sparkles,
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'todayOrders',
    label: "Today's Orders",
    helper: 'New orders placed across the storefront',
    icon: ShoppingCart,
    accent: 'bg-primary-50 text-primary-700',
  },
  {
    key: 'todayCustomers',
    label: 'New Customers',
    helper: 'Fresh accounts created today',
    icon: Users,
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    key: 'pendingOrders',
    label: 'Pending Orders',
    helper: 'Orders still awaiting attention',
    icon: AlertCircle,
    accent: 'bg-amber-50 text-amber-700',
  },
] as const;

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const rawValue = stats[card.key];
        const value = card.key === 'todayRevenue' ? formatPrice(rawValue) : formatCompactNumber(rawValue);

        return (
          <div key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{card.helper}</p>
          </div>
        );
      })}

      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:col-span-2 xl:col-span-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-primary-300">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Ops snapshot</p>
            <p className="text-sm text-slate-300">A quick view of the backlog that needs attention today.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Design queue</p>
            <p className="mt-1 text-xl font-semibold">{stats.pendingDesigns}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending reviews</p>
            <p className="mt-1 text-xl font-semibold">{stats.pendingReviews}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Low stock alerts</p>
            <p className="mt-1 text-xl font-semibold">{stats.lowStockCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
