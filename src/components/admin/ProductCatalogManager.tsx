'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Pencil, Plus, Power, RefreshCw } from 'lucide-react';
import type { AdminProductListItem } from '@/types/admin';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { formatDate, formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ProductListResponse {
  success: boolean;
  message?: string;
  data?: {
    products: AdminProductListItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const typeOptions = [
  { value: 'ALL', label: 'All product types' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'CUSTOMIZABLE_PHONE_COVER', label: 'Phone cover' },
  { value: 'CUSTOMIZABLE_FRAME', label: 'Photo frame' },
  { value: 'CUSTOMIZABLE_OTHER', label: 'Other custom' },
];

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active only' },
  { value: 'inactive', label: 'Inactive only' },
];

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    STANDARD: 'Standard',
    CUSTOMIZABLE_PHONE_COVER: 'Phone cover',
    CUSTOMIZABLE_FRAME: 'Photo frame',
    CUSTOMIZABLE_OTHER: 'Other custom',
  };

  return labels[type] ?? type;
}

export default function ProductCatalogManager() {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        status,
      });

      if (query.trim()) {
        params.set('search', query.trim());
      }

      if (type !== 'ALL') {
        params.set('type', type);
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' });
      const result = (await response.json()) as ProductListResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'Failed to load products.');
      }

      setProducts(result.data.products);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    } catch (loadError) {
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, query, status, type]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleToggleStatus = useCallback(async (product: AdminProductListItem) => {
    const nextAction = product.isActive ? 'deactivate' : 'restore';
    const confirmed = window.confirm(`Are you sure you want to ${nextAction} ${product.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update product status.');
      }

      await loadProducts();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to update product status.');
    }
  }, [loadProducts]);

  const columns = useMemo<DataTableColumn<AdminProductListItem>[]>(() => [
    {
      key: 'product',
      header: 'Product',
      render: (product) => (
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <Box className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500">/{product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (product) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {getTypeLabel(product.type)}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-semibold text-slate-900">{formatPrice(product.salePrice ?? product.basePrice)}</p>
          {product.salePrice && (
            <p className="text-xs text-slate-500 line-through">{formatPrice(product.basePrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center',
      render: (product) => (
        <span className={cn(
          'rounded-full px-2.5 py-1 text-xs font-semibold',
          product.stock <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
        )}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <div className="flex flex-wrap gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
          )}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
          {product.isFeatured && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (product) => <span className="text-sm text-slate-600">{formatDate(product.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'min-w-[180px]',
      render: (product) => (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/products/${product.id}`}>
            <Button size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant={product.isActive ? 'ghost' : 'secondary'}
            leftIcon={<Power className="h-3.5 w-3.5" />}
            onClick={() => void handleToggleStatus(product)}
          >
            {product.isActive ? 'Deactivate' : 'Restore'}
          </Button>
        </div>
      ),
    },
  ], [handleToggleStatus]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-600">Catalog workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Manage the live product catalog</h2>
            <p className="mt-1 text-sm text-slate-600">
              Track {total} catalog items, review stock levels, and update featured visibility without leaving the admin panel.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadProducts()}>
              Refresh
            </Button>
            <Link href="/admin/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add product</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          />
          <Select
            label="Type"
            options={typeOptions}
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        onSearch={(value) => {
          setQuery(value);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        emptyMessage="No products matched the current filters."
        emptyIcon={Box}
        searchPlaceholder="Search by name, slug, or SKU..."
      />
    </div>
  );
}
