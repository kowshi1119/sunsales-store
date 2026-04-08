'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { formatDate, formatPrice } from '@/lib/formatters';

interface CustomerRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string | null;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  isActive: boolean;
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string }>;
}

interface ApiResponse {
  customers: CustomerRow[];
  page: number;
  totalPages: number;
}

const statusOptions = [
  { value: 'all', label: 'All customers' },
  { value: 'active', label: 'Active only' },
  { value: 'inactive', label: 'Inactive only' },
];

export default function CustomerManagementPanel() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;

    const loadCustomers = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
          search,
          status,
        });
        const response = await fetch(`/api/admin/customers?${params.toString()}`, { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load customers.');
        }

        if (!ignore) {
          const data = payload.data as ApiResponse;
          setCustomers(data.customers);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : 'Failed to load customers.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [page, search, status]);

  const toggleActive = async (customer: CustomerRow) => {
    const confirmMessage = customer.isActive
      ? `Deactivate ${customer.fullName}'s account?`
      : `Reactivate ${customer.fullName}'s account?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id, isActive: !customer.isActive }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to update the customer account.');
      }

      setCustomers((current) => current.map((row) => (row.id === customer.id ? { ...row, isActive: !row.isActive } : row)));
      toast.success(payload.message || 'Customer updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update the customer account.');
    }
  };

  const columns = useMemo<DataTableColumn<CustomerRow>[]>(() => [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.fullName} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{row.fullName}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => <span className="text-slate-700">{row.phone}</span>,
    },
    {
      key: 'orderCount',
      header: 'Orders',
      align: 'center',
      render: (row) => <span className="font-semibold text-slate-900">{row.orderCount}</span>,
    },
    {
      key: 'totalSpent',
      header: 'Total spent',
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-900">{formatPrice(row.totalSpent)}</span>,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row) => <span className="text-slate-600">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Button variant={row.isActive ? 'danger' : 'outline'} size="sm" onClick={() => toggleActive(row)}>
          {row.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ], []);

  return (
    <div className="space-y-5">
      <div className="max-w-xs rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <Select
          label="Customer status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={statusOptions}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchPlaceholder="Search customers by name or email..."
        emptyMessage="No customers matched the current search."
        emptyIcon={Users}
      />
    </div>
  );
}
