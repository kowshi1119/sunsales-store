'use client';

import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { buildShopQueryString, type ShopFilterValues } from '@/components/product/ProductFilters';
import type { CategoryBasic, ProductType } from '@/types/product';

interface ActiveFiltersProps {
  values: ShopFilterValues;
  categories: CategoryBasic[];
}

const TYPE_LABELS: Record<ProductType, string> = {
  STANDARD: 'Ready to Ship',
  CUSTOMIZABLE_PHONE_COVER: 'Custom Phone Covers',
  CUSTOMIZABLE_FRAME: 'Custom Photo Frames',
  CUSTOMIZABLE_OTHER: 'Custom Gifts',
};

export default function ActiveFilters({ values, categories }: ActiveFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeItems: Array<{ key: string; label: string; onRemove: () => void }> = [];

  const pushValues = (nextValues: ShopFilterValues) => {
    const query = buildShopQueryString({ ...nextValues, page: 1 });
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (values.search) {
    activeItems.push({
      key: 'search',
      label: `Search: ${values.search}`,
      onRemove: () => pushValues({ ...values, search: '' }),
    });
  }

  values.categories.forEach((slug) => {
    const categoryName = categories.find((category) => category.slug === slug)?.name || slug;

    activeItems.push({
      key: `category-${slug}`,
      label: categoryName,
      onRemove: () => pushValues({
        ...values,
        categories: values.categories.filter((item) => item !== slug),
      }),
    });
  });

  if (values.type) {
    activeItems.push({
      key: 'type',
      label: TYPE_LABELS[values.type],
      onRemove: () => pushValues({ ...values, type: '' }),
    });
  }

  if (values.minPrice) {
    activeItems.push({
      key: 'minPrice',
      label: `Min Rs. ${values.minPrice}`,
      onRemove: () => pushValues({ ...values, minPrice: '' }),
    });
  }

  if (values.maxPrice) {
    activeItems.push({
      key: 'maxPrice',
      label: `Max Rs. ${values.maxPrice}`,
      onRemove: () => pushValues({ ...values, maxPrice: '' }),
    });
  }

  if (values.minRating) {
    activeItems.push({
      key: 'minRating',
      label: `${values.minRating}★ & up`,
      onRemove: () => pushValues({ ...values, minRating: '' }),
    });
  }

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {activeItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-1.5 text-body-sm text-foreground transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          aria-label={`Remove filter ${item.label}`}
        >
          <span>{item.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => pushValues({
          search: '',
          categories: [],
          type: '',
          minPrice: '',
          maxPrice: '',
          minRating: '',
          sort: 'newest',
          page: 1,
        })}
      >
        Clear all
      </Button>
    </div>
  );
}
