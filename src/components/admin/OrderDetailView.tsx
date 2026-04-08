'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, PackageCheck, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { formatDateTime, formatOrderStatus, formatPrice, getStatusColor } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface OrderDetailViewProps {
  orderId: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  couponCode?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  notes?: string | null;
  giftMessage?: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string; phone: string; avatar?: string | null };
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    district: string;
    province?: string | null;
    postalCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    productName: string;
    productImage?: string | null;
    variantName?: string | null;
    unitPrice: number;
    totalPrice: number;
    designId?: string | null;
    productSlug?: string | null;
    design?: { previewImage?: string | null; status?: string | null; adminNotes?: string | null } | null;
  }>;
  statusHistory: Array<{ id: string; status: string; note?: string | null; changedBy?: string | null; createdAt: string }>;
}

const transitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DESIGN_REVIEW', 'SHIPPED', 'CANCELLED'],
  DESIGN_REVIEW: ['DESIGN_APPROVED', 'CANCELLED'],
  DESIGN_APPROVED: ['PRODUCTION'],
  PRODUCTION: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

function StatusPill({ value }: { value: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(value))}>
      {formatOrderStatus(value)}
    </span>
  );
}

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const loadOrder = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to load order detail.');
      }

      const data = payload.data as OrderDetail;
      setOrder(data);
      setNextStatus('');
      setTrackingNumber(data.trackingNumber || '');
      setTrackingUrl(data.trackingUrl || '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load order detail.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const nextStatusOptions = useMemo(() => {
    if (!order) {
      return [];
    }

    const hasCustomDesign = order.items.some((item) => Boolean(item.designId));
    const base = transitions[order.status] ?? [];
    const filtered = order.status === 'PROCESSING' && !hasCustomDesign
      ? base.filter((value) => value !== 'DESIGN_REVIEW')
      : base;

    return filtered.map((value) => ({ value, label: formatOrderStatus(value) }));
  }, [order]);

  const submitUpdate = async () => {
    if (!nextStatus) {
      toast.error('Please choose the next status.');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note, trackingNumber, trackingUrl }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to update the order.');
      }

      toast.success(payload.message || 'Order updated.');
      setNote('');
      await loadOrder();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update the order.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />;
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">This order could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <h2 className="mt-3 font-mono text-2xl font-bold text-slate-950">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-slate-600">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill value={order.status} />
          <StatusPill value={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customer</p>
              <p className="mt-3 text-base font-semibold text-slate-950">{order.user.fullName}</p>
              <p className="mt-1 text-sm text-slate-600">{order.user.email}</p>
              <p className="text-sm text-slate-600">{order.user.phone}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping</p>
              <p className="mt-3 text-sm text-slate-700">
                {order.address.addressLine1}
                {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}, {order.address.city}, {order.address.district}
                {order.address.province ? `, ${order.address.province}` : ''} {order.address.postalCode}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment</p>
              <p className="mt-3 text-base font-semibold text-slate-950">{order.paymentMethod}</p>
              {order.trackingNumber && <p className="mt-1 text-sm text-slate-600">Tracking: {order.trackingNumber}</p>}
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                  Open tracking <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Order items</h3>
                <p className="text-sm text-slate-600">{order.items.length} item{order.items.length === 1 ? '' : 's'} included in this order.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized={item.productImage.startsWith('/images/')}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">{item.productName}</p>
                        <p className="text-sm text-slate-600">{item.variantName || 'Default option'} • Qty {item.quantity}</p>
                        {item.productSlug && (
                          <Link href={`/shop/${item.productSlug}`} className="mt-1 inline-flex text-xs font-semibold text-primary-600 hover:text-primary-700">
                            View product
                          </Link>
                        )}
                      </div>
                      <p className="font-semibold text-slate-950">{formatPrice(item.totalPrice)}</p>
                    </div>
                    {item.design?.previewImage && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={item.design.previewImage}
                            alt="Custom design preview"
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized={item.design.previewImage.startsWith('/images/')}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Custom design attached</p>
                          <p className="text-xs text-slate-500">{item.design.status ? formatOrderStatus(item.design.status) : 'Draft design'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Status history</h3>
            <div className="mt-4 space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill value={entry.status} />
                      <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
                    </div>
                    {entry.note && <p className="mt-1 text-sm text-slate-700">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Update status</h3>
            <div className="mt-4 space-y-4">
              <Select
                label="Next status"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                options={nextStatusOptions}
                placeholder={nextStatusOptions.length > 0 ? 'Choose next step' : 'No further transitions'}
                disabled={nextStatusOptions.length === 0}
              />
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Tracking number (optional)"
                className="h-11 w-full rounded-md border border-surface-border px-4 text-sm"
              />
              <input
                value={trackingUrl}
                onChange={(event) => setTrackingUrl(event.target.value)}
                placeholder="Tracking URL (optional)"
                className="h-11 w-full rounded-md border border-surface-border px-4 text-sm"
              />
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 500))}
                rows={4}
                placeholder="Add a note for the timeline, tracking, or reason..."
                className="w-full rounded-md border border-surface-border px-4 py-3 text-sm"
              />
              <Button fullWidth onClick={submitUpdate} isLoading={isUpdating} loadingText="Updating..." rightIcon={<Save className="h-4 w-4" />}>
                Update status
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Totals</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
              {order.couponCode && <div className="flex justify-between text-slate-600"><span>Coupon</span><span>{order.couponCode}</span></div>}
              <div className="border-t border-slate-200 pt-2 text-base font-semibold text-slate-950"><div className="flex justify-between"><span>Total</span><span>{formatPrice(order.total)}</span></div></div>
            </div>
            {(order.notes || order.giftMessage) && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                {order.giftMessage && <p className="mt-2"><strong>Gift message:</strong> {order.giftMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
