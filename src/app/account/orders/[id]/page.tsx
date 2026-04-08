import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import OrderTracker from '@/components/account/OrderTracker';
import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { formatOrderStatus, formatPrice, getStatusColor } from '@/lib/formatters';
import prisma from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: OrderDetailPageProps): Metadata {
  return buildMetadata({
    title: `Order ${params.id}`,
    description: 'Review a single Sun Sales order summary, fulfillment status, and delivery notes.',
    url: `/account/orders/${params.id}`,
    noIndex: true,
  });
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      address: true,
      items: {
        include: {
          product: { select: { slug: true } },
          design: { select: { previewImage: true, status: true, adminNotes: true } },
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
        <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Order detail</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-md font-display text-foreground">{order.orderNumber}</h1>
            <p className="mt-1 text-body-sm text-muted">Payment method: {order.paymentMethod.replaceAll('_', ' ')}</p>
          </div>
          <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(order.status))}>
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
        <h2 className="text-display-sm font-display text-foreground">Order tracker</h2>
        <div className="mt-4">
          <OrderTracker
            currentStatus={order.status}
            history={order.statusHistory.map((entry) => ({
              id: entry.id,
              status: entry.status,
              note: entry.note,
              createdAt: entry.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
        <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
          <h2 className="text-display-sm font-display text-foreground">Items</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-surface-border bg-surface-warm/30 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized={item.productImage.startsWith('/images/')}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <p className="text-body-sm text-muted">{item.variantName || 'Default option'} • Qty {item.quantity}</p>
                      {item.design?.previewImage && <p className="mt-1 text-body-xs font-semibold text-primary-600">Custom design attached</p>}
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(Number(item.totalPrice))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card">
            <h3 className="text-display-sm font-display text-foreground">Shipping</h3>
            <p className="mt-3 text-body-sm text-muted">
              {order.address.addressLine1}
              {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}, {order.address.city}, {order.address.district}
              {order.address.province ? `, ${order.address.province}` : ''} {order.address.postalCode}
            </p>
          </div>

          <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card">
            <h3 className="text-display-sm font-display text-foreground">Totals</h3>
            <div className="mt-4 space-y-2 text-body-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              <div className="flex justify-between text-muted"><span>Shipping</span><span>{formatPrice(Number(order.shippingCost))}</span></div>
              <div className="flex justify-between text-muted"><span>Discount</span><span>-{formatPrice(Number(order.discount))}</span></div>
              <div className="border-t border-surface-border pt-2 text-body-md font-semibold text-foreground"><div className="flex justify-between"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/account/orders">
          <Button>Back to orders</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline">Need help?</Button>
        </Link>
      </div>
    </div>
  );
}
