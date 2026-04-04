'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Filter, Search, SlidersHorizontal, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { CategoryBasic, ProductType } from '@/types/product';

export type ShopSortValue = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';

export interface ShopFilterValues {
  search: string;
  categories: string[];
  type: ProductType | '';
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: ShopSortValue;
  page: number;
}

interface ProductFiltersProps {
  categories: CategoryBasic[];
  values: ShopFilterValues;
  mode?: 'desktop' | 'mobile';
  className?: string;
}

const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductType; label: string; description: string }> = [
  {
    value: 'STANDARD',
    label: 'Ready to Ship',
    description: 'Classic gifts and accessories available immediately.',
  },
  {
    value: 'CUSTOMIZABLE_PHONE_COVER',
    label: 'Custom Phone Covers',
    description: 'Personalized cases with photos, text, and artwork.',
  },
  {
    value: 'CUSTOMIZABLE_FRAME',
    label: 'Custom Photo Frames',
    description: 'Thoughtful keepsakes designed around your favorite memories.',
  },
  {
    value: 'CUSTOMIZABLE_OTHER',
    label: 'Other Custom Gifts',
    description: 'Additional made-for-you products from the studio.',
  },
];

const RATING_OPTIONS = [
  { value: '4', label: '4★ & up' },
  { value: '3', label: '3★ & up' },
  { value: '2', label: '2★ & up' },
  { value: '1', label: '1★ & up' },
] as const;

export function buildShopQueryString(values: ShopFilterValues): string {
  const params = new URLSearchParams();

  if (values.search.trim()) params.set('search', values.search.trim());
  if (values.categories.length > 0) params.set('category', values.categories.join(','));
  if (values.type) params.set('type', values.type);
  if (values.minPrice.trim()) params.set('minPrice', values.minPrice.trim());
  if (values.maxPrice.trim()) params.set('maxPrice', values.maxPrice.trim());
  if (values.minRating.trim()) params.set('minRating', values.minRating.trim());
  if (values.sort !== 'newest') params.set('sort', values.sort);
  if (values.page > 1) params.set('page', String(values.page));

  return params.toString();
}

function FilterPanel({
  categories,
  draft,
  onDraftChange,
  onCategoryToggle,
  onApply,
  onReset,
}: {
  categories: CategoryBasic[];
  draft: ShopFilterValues;
  onDraftChange: (values: ShopFilterValues) => void;
  onCategoryToggle: (slug: string) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-body-sm font-semibold uppercase tracking-wider text-muted">Search</p>
        <Input
          value={draft.search}
          onChange={(event) => onDraftChange({ ...draft, search: event.target.value })}
          placeholder="Search gifts, covers, frames..."
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search products"
        />
      </div>

      <div>
        <p className="mb-3 text-body-sm font-semibold uppercase tracking-wider text-muted">Categories</p>
        <div className="space-y-2.5">
          {categories.length === 0 ? (
            <p className="text-body-sm text-muted">Categories will appear once catalog data is available.</p>
          ) : (
            categories.map((category) => {
              const checked = draft.categories.includes(category.slug);

              return (
                <label key={category.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-warm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCategoryToggle(category.slug)}
                    className="h-4 w-4 rounded border-surface-border text-primary-500 focus:ring-primary-400"
                  />
                  <span className="text-body-sm text-foreground">{category.name}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-body-sm font-semibold uppercase tracking-wider text-muted">Price Range</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.minPrice}
            onChange={(event) => onDraftChange({ ...draft, minPrice: event.target.value })}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.maxPrice}
            onChange={(event) => onDraftChange({ ...draft, maxPrice: event.target.value })}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-body-sm font-semibold uppercase tracking-wider text-muted">Product Type</p>
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-warm">
            <input
              type="radio"
              name="product-type"
              checked={draft.type === ''}
              onChange={() => onDraftChange({ ...draft, type: '' })}
              className="mt-1 h-4 w-4 border-surface-border text-primary-500 focus:ring-primary-400"
            />
            <span>
              <span className="block text-body-sm font-medium text-foreground">All Types</span>
              <span className="block text-body-xs text-muted">Show the full catalog.</span>
            </span>
          </label>

          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-warm">
              <input
                type="radio"
                name="product-type"
                checked={draft.type === option.value}
                onChange={() => onDraftChange({ ...draft, type: option.value })}
                className="mt-1 h-4 w-4 border-surface-border text-primary-500 focus:ring-primary-400"
              />
              <span>
                <span className="block text-body-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-body-xs text-muted">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-body-sm font-semibold uppercase tracking-wider text-muted">Minimum Rating</p>
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-warm">
            <input
              type="radio"
              name="min-rating"
              checked={draft.minRating === ''}
              onChange={() => onDraftChange({ ...draft, minRating: '' })}
              className="h-4 w-4 border-surface-border text-primary-500 focus:ring-primary-400"
            />
            <span className="text-body-sm text-foreground">All ratings</span>
          </label>

          {RATING_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-warm">
              <input
                type="radio"
                name="min-rating"
                checked={draft.minRating === option.value}
                onChange={() => onDraftChange({ ...draft, minRating: option.value })}
                className="h-4 w-4 border-surface-border text-primary-500 focus:ring-primary-400"
              />
              <span className="inline-flex items-center gap-1 text-body-sm text-foreground">
                <Star className="h-3.5 w-3.5 text-primary-500" />
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
        <Button fullWidth onClick={onApply} leftIcon={<Filter className="h-4 w-4" />}>
          Apply Filters
        </Button>
        <Button variant="outline" fullWidth onClick={onReset}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

export default function ProductFilters({ categories, values, mode = 'desktop', className }: ProductFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ShopFilterValues>(values);

  useEffect(() => {
    setDraft(values);
  }, [values]);

  const pushFilters = (nextValues: ShopFilterValues) => {
    const query = buildShopQueryString(nextValues);
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleApply = () => {
    pushFilters({ ...draft, page: 1 });
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetValues: ShopFilterValues = {
      search: '',
      categories: [],
      type: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
      page: 1,
    };

    setDraft(resetValues);
    pushFilters(resetValues);
    setIsOpen(false);
  };

  const handleCategoryToggle = (slug: string) => {
    setDraft((current) => {
      const categoriesList = current.categories.includes(slug)
        ? current.categories.filter((item) => item !== slug)
        : [...current.categories, slug];

      return {
        ...current,
        categories: categoriesList,
      };
    });
  };

  if (mode === 'mobile') {
    return (
      <>
        <Button
          variant="outline"
          className={cn('lg:hidden', className)}
          onClick={() => setIsOpen(true)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
        >
          Filters
        </Button>

        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="bottom" title="Filter Products">
          <div className="p-4 pb-6">
            <FilterPanel
              categories={categories}
              draft={draft}
              onDraftChange={setDraft}
              onCategoryToggle={handleCategoryToggle}
              onApply={handleApply}
              onReset={handleReset}
            />
          </div>
        </Drawer>
      </>
    );
  }

  return (
    <aside className={cn('hidden lg:block', className)}>
      <div className="sticky top-24 rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-500" />
          <h2 className="text-body-lg font-semibold text-foreground">Filters</h2>
        </div>

        <FilterPanel
          categories={categories}
          draft={draft}
          onDraftChange={setDraft}
          onCategoryToggle={handleCategoryToggle}
          onApply={handleApply}
          onReset={handleReset}
        />
      </div>
    </aside>
  );
}
