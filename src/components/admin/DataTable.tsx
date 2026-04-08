'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, type LucideIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { EmptyState, Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

type SortOrder = 'asc' | 'desc';

type ColumnAlignment = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: ColumnAlignment;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (sortBy: string, sortOrder: SortOrder) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  searchPlaceholder?: string;
}

function alignmentClass(align: ColumnAlignment = 'left') {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  onSearch,
  sortBy,
  sortOrder = 'asc',
  onSort,
  page = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = 'No records found.',
  emptyIcon,
  searchPlaceholder = 'Search records...',
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : data.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onSelectionChange([...selectedIds, id]);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
        {onSearch ? (
          <div className="w-full max-w-md">
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        ) : (
          <div />
        )}

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {[10, 20, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key} className={cn('px-4 py-3 font-medium', alignmentClass(column.align))}>
                  {column.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key, sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="inline-flex items-center gap-2 text-left"
                    >
                      {column.header}
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {selectable && (
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-4" rounded="sm" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={`${column.key}-${rowIndex}`} className="px-4 py-4">
                      <Skeleton className="h-4 w-full max-w-[180px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState icon={emptyIcon} title="Nothing to show" description={emptyMessage} className="py-12" />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  {selectable && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Select row ${row.id}`}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.key}`} className={cn('px-4 py-4 align-top', alignmentClass(column.align), column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
