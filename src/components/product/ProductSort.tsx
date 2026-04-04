'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import Select from '@/components/ui/Select';
import { buildShopQueryString, type ShopFilterValues, type ShopSortValue } from '@/components/product/ProductFilters';

interface ProductSortProps {
  values: ShopFilterValues;
}

const SORT_OPTIONS: Array<{ value: ShopSortValue; label: string }> = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function ProductSort({ values }: ProductSortProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-full sm:w-[260px]">
      <Select
        label="Sort by"
        aria-label="Sort products"
        value={values.sort}
        onChange={(event) => {
          const nextValues: ShopFilterValues = {
            ...values,
            sort: event.target.value as ShopSortValue,
            page: 1,
          };

          const query = buildShopQueryString(nextValues);
          router.push(query ? `${pathname}?${query}` : pathname);
        }}
        leftIcon={<ArrowUpDown className="h-4 w-4" />}
        options={SORT_OPTIONS}
      />
    </div>
  );
}
