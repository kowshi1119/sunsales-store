'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductCard, { ProductCardSkeleton } from '@/components/product/ProductCard';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { EmptyState } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import type { ProductListItem } from '@/types/product';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen">
        <div className="container-base py-10">
          <div className="h-8 bg-surface-warm rounded w-48 mb-4 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPage(1);

    fetch(`/api/search?q=${encodeURIComponent(query)}&page=1&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data.products);
          setTotal(data.data.total);
          setHasMore(data.data.hasMore);
        }
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setIsLoading(false));
  }, [query]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${nextPage}&limit=12`);
    const data = await res.json();
    if (data.success) {
      setProducts((prev) => [...prev, ...data.data.products]);
      setHasMore(data.data.hasMore);
      setPage(nextPage);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container-base">
        <Breadcrumbs items={[{ label: 'Search', href: '/search' }, { label: query || 'Results' }]} />

        <AnimatedSection className="py-6 md:py-10">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-primary-500" />
            <h1 className="text-display-md md:text-display-lg font-display text-foreground">
              {query ? `Results for "${query}"` : 'Search'}
            </h1>
          </div>
          {!isLoading && query && (
            <p className="text-body-md text-muted">
              {total} product{total !== 1 ? 's' : ''} found
            </p>
          )}
        </AnimatedSection>

        <AnimatedSection delay={100}>
          {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Search}
            title={query ? 'No products found' : 'Start searching'}
            description={
              query
                ? `We couldn't find any products matching "${query}". Try different keywords or browse our categories.`
                : 'Enter a search term to find products, categories, or brands.'
            }
            action={
              query ? (
                <Link href="/shop">
                  <Button variant="outline">Browse All Products</Button>
                </Link>
              ) : undefined
            }
            className="pb-20"
          />
        ) : (
          <div className="pb-16">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 text-center">
                <Button variant="outline" onClick={loadMore}>
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        )}
        </AnimatedSection>
      </div>
    </div>
  );
}
