import Link from 'next/link';
import { ArrowRight, PackageSearch } from 'lucide-react';
import type { AdminOrderListItem } from '@/types/admin';
import { formatOrderStatus, formatPrice, formatRelativeTime, getStatusColor } from '@/lib/formatters';
import { Badge } from '@/components/ui/Skeleton';

interface RecentOrdersProps {
  orders: AdminOrderListItem[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Recent orders</h2>
          <p className="text-sm text-slate-600">The latest 10 orders flowing through the store.</p>
        </div>
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-warm">
            <PackageSearch className="h-7 w-7 text-muted-light" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-display-sm font-display text-foreground">No orders yet</h3>
          <p className="max-w-md text-body-md text-muted">
            New orders will appear here as soon as customers start checking out.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
                      {order.hasCustomDesign && <Badge variant="outline">Custom</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatRelativeTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
