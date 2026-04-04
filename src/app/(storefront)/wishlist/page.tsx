'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, LogIn } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductCard, { ProductCardSkeleton } from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { useHydration } from '@/hooks/useHydration';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { ProductListItem } from '@/types/product';

interface WishlistApiItem {
  id: string;
  productId: string;
  product: ProductListItem;
}

export default function WishlistPage() {
  const hydrated = useHydration();
  const localCount = useWishlistStore((state) => state.items.length);
  const [items, setItems] = useState<WishlistApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist', { cache: 'no-store' });
        const result = await response.json();

        if (!isMounted) return;

        if (response.ok && result.success && Array.isArray(result.data)) {
          const normalizedItems = result.data.map((item: WishlistApiItem) => ({
            ...item,
            product: {
              ...item.product,
              isFeatured: item.product.isFeatured ?? false,
              isBestSeller: item.product.isBestSeller ?? false,
              isNewArrival: item.product.isNewArrival ?? false,
              categories: item.product.categories ?? [],
            },
          }));

          setItems(normalizedItems);
        }
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasLocalItems = hydrated && localCount > 0;
  const products = useMemo(() => items.map((item) => item.product), [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Wishlist', href: '/wishlist' }]} />

        <div className="mb-8">
          <h1 className="text-display-md font-display text-foreground">Wishlist</h1>
          <p className="mt-1 text-body-md text-muted">
            Keep track of the gifts and designs you want to come back to.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : hasLocalItems ? (
          <EmptyState
            icon={Heart}
            title="Your saved items need syncing"
            description={`You currently have ${localCount} item${localCount === 1 ? '' : 's'} saved locally. Sign in to sync them with your account.`}
            action={
              <Link href="/login?callbackUrl=/wishlist">
                <Button rightIcon={<LogIn className="h-4 w-4" />}>Sign In to Sync</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love so you can find them again in one place."
            action={
              <Link href="/shop">
                <Button>Explore the Shop</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
