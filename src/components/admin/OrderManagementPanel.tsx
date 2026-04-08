'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarRange, Eye, PackageSearch } from 'lucide-react';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { formatOrderStatus, formatPrice, formatRelativeTime, getStatusColor } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AdminOrderListItem } from '@/types/admin';

interface ApiResponse {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'DESIGN_REVIEW', label: 'Design Review' },
  { value: 'DESIGN_APPROVED', label: 'Design Approved' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const paymentOptions = [
  { value: 'all', label: 'All payment states' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

function StatusPill({ value }: { value: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(value))}>
      {formatOrderStatus(value)}
    </span>
  );
}

export default function OrderManagementPanel() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
          search,
          status,
          paymentStatus,
          dateFrom,
          dateTo,
        });

        const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load orders.');
        }

        if (!ignore) {
          const data = payload.data as ApiResponse;
          setOrders(data.orders);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : 'Failed to load orders.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [page, search, status, paymentStatus, dateFrom, dateTo]);

  const columns = useMemo<DataTableColumn<AdminOrderListItem>[]>(() => [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row) => (
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{row.orderNumber}</p>
          {row.hasCustomDesign && <p className="text-xs text-primary-600">Custom design</p>}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.customerName}</p>
          <p className="text-xs text-slate-500">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      align: 'center',
      render: (row) => <span className="text-slate-700">{row.itemCount}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-900">{formatPrice(row.total)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill value={row.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <StatusPill value={row.paymentStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Placed',
      render: (row) => <span className="text-slate-600">{formatRelativeTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`}>
          <Button variant="outline" size="sm" rightIcon={<Eye className="h-4 w-4" />}>
            View
          </Button>
        </Link>
      ),
    },
  ], []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} options={statusOptions} />
        <Select label="Payment" value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(1); }} options={paymentOptions} />
        <Input label="From" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} leftIcon={<CalendarRange className="h-4 w-4" />} />
        <Input label="To" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} leftIcon={<CalendarRange className="h-4 w-4" />} />
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={() => {
              setStatus('all');
              setPaymentStatus('all');
              setDateFrom('');
              setDateTo('');
              setSearch('');
              setPage(1);
            }}
          >
            Reset filters
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No orders matched the current filters."
        emptyIcon={PackageSearch}
        searchPlaceholder="Search order #, name, or email..."
      />
    </div>
  );
}
