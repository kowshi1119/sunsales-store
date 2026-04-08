import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Heart, Package, Palette, ShoppingBag, UserCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { formatOrderStatus, formatPrice, formatRelativeTime, getStatusColor } from '@/lib/formatters';
import prisma from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const metadata = buildMetadata({
  title: 'My Account',
  description: 'Manage your Sun Sales account, saved items, and upcoming orders.',
  url: '/account',
  noIndex: true,
});

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name || 'Sun Sales customer';

  let totalOrders = 0;
  let wishlistItems = 0;
  let savedDesigns = 0;
  let recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string }> = [];

  if (userId && process.env.DATABASE_URL) {
    try {
      const [ordersCount, wishlistCount, designsCount, orders] = await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.wishlistItem.count({ where: { userId } }),
        prisma.savedDesign.count({ where: { userId } }),
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

      totalOrders = ordersCount;
      wishlistItems = wishlistCount;
      savedDesigns = designsCount;
      recentOrders = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      }));
    } catch {
      recentOrders = [];
    }
  }

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: Package },
    { label: 'Wishlist Items', value: wishlistItems, icon: Heart },
    { label: 'Saved Designs', value: savedDesigns, icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Account</p>
            <h1 className="text-display-md font-display text-foreground">Hello, {userName}!</h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-body-md text-muted">
          Track your orders, manage saved addresses, and keep your profile ready for a smooth checkout experience.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop">
            <Button leftIcon={<ShoppingBag className="h-4 w-4" />}>Browse Shop</Button>
          </Link>
          <Link href="/customize/phone-cover">
            <Button variant="outline">Design Phone Cover</Button>
          </Link>
          <Link href="/account/profile">
            <Button variant="ghost">Edit Profile</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-surface-border bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm text-muted">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-display-sm font-display text-foreground">Recent orders</h2>
            <p className="text-body-sm text-muted">Your latest purchases and fulfillment progress at a glance.</p>
          </div>
          <Link href="/account/orders" className="text-body-sm font-semibold text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-surface-warm/60 px-4 py-5 text-body-sm text-muted">
            You have not placed any orders yet. Once you check out, your order timeline will appear here.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-2xl border border-surface-border bg-surface-warm/30 p-4 transition-all hover:border-primary-200 hover:shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</p>
                    <p className="mt-1 text-body-sm text-muted">{formatRelativeTime(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(order.status))}>
                      {formatOrderStatus(order.status)}
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
