import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import ActiveFilters from '@/components/product/ActiveFilters';
import ProductFilters, { type ShopFilterValues, type ShopSortValue } from '@/components/product/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid';
import ProductSort from '@/components/product/ProductSort';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/shared/SectionHeading';
import Button from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE, SITE_URL } from '@/lib/constants';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import type { ApiResponse } from '@/types/api';
import type { CategoryBasic, ProductListItem, ProductType } from '@/types/product';

export const dynamic = 'force-dynamic';

interface ShopProductsData {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface ShopPageData extends ShopProductsData {
  categories: CategoryBasic[];
  hasError: boolean;
  message: string;
}

interface ShopPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const VALID_SORTS: ShopSortValue[] = ['newest', 'oldest', 'price_asc', 'price_desc', 'popular', 'rating'];
const VALID_PRODUCT_TYPES: ProductType[] = [
  'STANDARD',
  'CUSTOMIZABLE_PHONE_COVER',
  'CUSTOMIZABLE_FRAME',
  'CUSTOMIZABLE_OTHER',
];

function getStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getListParam(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => item.split(',')).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function formatSlugLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeFilters(searchParams?: Record<string, string | string[] | undefined>): ShopFilterValues {
  const rawSort = getStringParam(searchParams?.sort);
  const rawType = getStringParam(searchParams?.type);
  const rawPage = Number(getStringParam(searchParams?.page) || '1');
  const rawMinRating = getStringParam(searchParams?.minRating);

  return {
    search: getStringParam(searchParams?.search),
    categories: getListParam(searchParams?.category),
    type: VALID_PRODUCT_TYPES.includes(rawType as ProductType) ? (rawType as ProductType) : '',
    minPrice: getStringParam(searchParams?.minPrice),
    maxPrice: getStringParam(searchParams?.maxPrice),
    minRating: rawMinRating && ['1', '2', '3', '4', '5'].includes(rawMinRating) ? rawMinRating : '',
    sort: VALID_SORTS.includes(rawSort as ShopSortValue) ? (rawSort as ShopSortValue) : 'newest',
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

function buildShopHref(values: ShopFilterValues, overrides: Partial<ShopFilterValues> = {}): string {
  const nextValues = { ...values, ...overrides };
  const params = new URLSearchParams();

  if (nextValues.search.trim()) params.set('search', nextValues.search.trim());
  if (nextValues.categories.length > 0) params.set('category', nextValues.categories.join(','));
  if (nextValues.type) params.set('type', nextValues.type);
  if (nextValues.minPrice.trim()) params.set('minPrice', nextValues.minPrice.trim());
  if (nextValues.maxPrice.trim()) params.set('maxPrice', nextValues.maxPrice.trim());
  if (nextValues.minRating.trim()) params.set('minRating', nextValues.minRating.trim());
  if (nextValues.sort !== 'newest') params.set('sort', nextValues.sort);
  if (nextValues.page > 1) params.set('page', String(nextValues.page));

  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages: number[] = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return [...new Set(pages)];
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const filters = normalizeFilters(searchParams);
  const primaryCategory = filters.categories[0];

  if (filters.search) {
    return buildMetadata({
      title: `Search results for ${filters.search}`,
      description: `Browse Sun Sales results for “${filters.search}” with premium gifts, phone covers, and personalized keepsakes.`,
      url: buildShopHref(filters),
    });
  }

  if (primaryCategory) {
    const categoryLabel = formatSlugLabel(primaryCategory);

    return buildMetadata({
      title: `${categoryLabel} Collection`,
      description: `Explore Sun Sales ${categoryLabel.toLowerCase()} with premium quality gifts and customizable keepsakes.`,
      url: buildShopHref(filters),
    });
  }

  return buildMetadata({
    title: 'Shop',
    description: 'Browse the Sun Sales collection of premium gifts, phone covers, and personalized keepsakes.',
    url: '/shop',
  });
}

async function getShopPageData(filters: ShopFilterValues): Promise<ShopPageData> {
  if (!process.env.DATABASE_URL) {
    return {
      products: [],
      categories: [],
      total: 0,
      page: filters.page,
      totalPages: 0,
      hasMore: false,
      hasError: true,
      message: 'Connect a database to browse the full live catalog in this environment.',
    };
  }

  try {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: String(DEFAULT_PAGE_SIZE),
    });

    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','));
    if (filters.type) params.set('type', filters.type);
    if (filters.minPrice.trim()) params.set('minPrice', filters.minPrice.trim());
    if (filters.maxPrice.trim()) params.set('maxPrice', filters.maxPrice.trim());
    if (filters.minRating.trim()) params.set('minRating', filters.minRating.trim());
    if (filters.sort !== 'newest') params.set('sort', filters.sort);

    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${SITE_URL}/api/products?${params.toString()}`, { cache: 'no-store' }),
      fetch(`${SITE_URL}/api/categories`, { cache: 'no-store' }),
    ]);

    const productsPayload = (await productsResponse.json()) as ApiResponse<ShopProductsData>;
    const categoriesPayload = categoriesResponse.ok
      ? ((await categoriesResponse.json()) as ApiResponse<Array<CategoryBasic & { children?: CategoryBasic[] }>>)
      : null;

    if (!productsResponse.ok || !productsPayload.success || !productsPayload.data) {
      return {
        products: [],
        categories: [],
        total: 0,
        page: filters.page,
        totalPages: 0,
        hasMore: false,
        hasError: true,
        message: productsPayload.message || 'We could not load products right now. Please try again shortly.',
      };
    }

    const categories = categoriesPayload?.success && Array.isArray(categoriesPayload.data)
      ? categoriesPayload.data.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }))
      : [];

    return {
      products: productsPayload.data.products,
      total: productsPayload.data.total,
      page: productsPayload.data.page,
      totalPages: productsPayload.data.totalPages,
      hasMore: productsPayload.data.hasMore,
      categories,
      hasError: false,
      message: '',
    };
  } catch (error) {
    console.error('Shop page data error:', error);
    return {
      products: [],
      categories: [],
      total: 0,
      page: filters.page,
      totalPages: 0,
      hasMore: false,
      hasError: true,
      message: 'The storefront is temporarily unavailable. Please refresh and try again.',
    };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters = normalizeFilters(searchParams);
  const { products, categories, total, totalPages, hasError, message } = await getShopPageData(filters);
  const visiblePages = getVisiblePages(filters.page, totalPages);
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.categories.length > 0 ||
    filters.type ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.sort !== 'newest'
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }]} />

        <SectionHeading
          eyebrow="Browse"
          title="Shop Sun Sales"
          description="Discover premium gifts, custom phone covers, and personalized keepsakes crafted for unforgettable moments."
          align="left"
          className="mb-6"
        />

        {categories.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-1 lg:hidden">
            <div className="flex min-w-max items-center gap-2">
              <Link
                href={buildShopHref(filters, { categories: [], page: 1 })}
                className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${filters.categories.length === 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-surface-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'}`}
              >
                All Products
              </Link>

              {categories.map((category) => {
                const isActive = filters.categories.includes(category.slug);
                const nextCategories = isActive
                  ? filters.categories.filter((item) => item !== category.slug)
                  : [...filters.categories, category.slug];

                return (
                  <Link
                    key={category.id}
                    href={buildShopHref(filters, { categories: nextCategories, page: 1 })}
                    className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${isActive ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-surface-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ProductFilters categories={categories} values={filters} mode="desktop" />

          <div>
            <div className="mb-4 rounded-2xl border border-surface-border bg-white p-4 shadow-card">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-body-md font-semibold text-foreground">
                    Showing {products.length} of {total} products
                  </p>
                  <p className="mt-1 text-body-sm text-muted">
                    Filter by category, price, type, and rating to find the perfect gift faster.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <ProductFilters categories={categories} values={filters} mode="mobile" />
                  <ProductSort values={filters} />
                </div>
              </div>
            </div>

            <ActiveFilters values={filters} categories={categories} />

            {hasError ? (
              <div className="rounded-3xl border border-surface-border bg-white px-6 py-12 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <PackageSearch className="h-7 w-7" />
                </div>
                <h2 className="text-display-sm font-display text-foreground">Catalog temporarily unavailable</h2>
                <p className="mx-auto mt-3 max-w-2xl text-body-md text-muted">{message}</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link href={buildShopHref(filters)}>
                    <Button variant="outline">Retry</Button>
                  </Link>
                  <Link href="/search?q=gift">
                    <Button>Try Search Instead</Button>
                  </Link>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-surface-border bg-white px-6 py-12 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-warm text-muted">
                  <PackageSearch className="h-7 w-7" />
                </div>
                <h2 className="text-display-sm font-display text-foreground">No products found</h2>
                <p className="mx-auto mt-3 max-w-2xl text-body-md text-muted">
                  Try adjusting your filters or clear them to explore the full Sun Sales collection.
                </p>
                <div className="mt-5">
                  <Link href="/shop">
                    <Button variant="outline">Clear Filters</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <Link href={buildShopHref(filters, { page: Math.max(1, filters.page - 1) })}>
                      <Button variant="outline" size="sm" disabled={filters.page === 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                        Previous
                      </Button>
                    </Link>

                    {visiblePages.map((pageNumber) => (
                      <Link key={pageNumber} href={buildShopHref(filters, { page: pageNumber })} aria-current={pageNumber === filters.page ? 'page' : undefined}>
                        <Button variant={pageNumber === filters.page ? 'primary' : 'outline'} size="sm">
                          {pageNumber}
                        </Button>
                      </Link>
                    ))}

                    <Link href={buildShopHref(filters, { page: Math.min(totalPages, filters.page + 1) })}>
                      <Button variant="outline" size="sm" disabled={filters.page === totalPages} rightIcon={<ChevronRight className="h-4 w-4" />}>
                        Next
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {!hasError && !hasActiveFilters && categories.length > 0 && (
              <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-4 md:p-5">
                <p className="text-body-sm font-semibold uppercase tracking-wider text-muted">Popular collections</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={buildShopHref(filters, { categories: [category.slug], page: 1 })}
                      className="rounded-full border border-surface-border bg-white px-4 py-2 text-body-sm text-foreground transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
