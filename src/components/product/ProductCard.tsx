'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { calculateDiscount } from '@/lib/utils';
import { useCartStore, type CartItemLocal } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useHydration } from '@/hooks/useHydration';
import type { ProductListItem } from '@/types/product';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hydrated = useHydration();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = hydrated && isInWishlist(product.id);

  const price = Number(product.basePrice);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const isOnSale = salePrice !== null && salePrice < price;
  const discount = isOnSale ? calculateDiscount(price, salePrice) : 0;
  const displayPrice = isOnSale ? salePrice : price;
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];

  const badge = product.isNewArrival
    ? { label: 'New', class: 'bg-primary-400 text-white' }
    : isOnSale
    ? { label: `-${discount}%`, class: 'bg-error-500 text-white' }
    : product.isBestSeller
    ? { label: 'Best Seller', class: 'bg-accent-gold text-white' }
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const item: CartItemLocal = {
      productId: product.id,
      variantId: null,
      quantity: 1,
      designId: null,
      name: product.name,
      price,
      salePrice,
      image: primaryImage?.url || '',
      variantName: null,
      slug: product.slug,
    };

    addItem(item);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <article className={cn('group relative', className)}>
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1">
          {/* Image container */}
          <div className="relative aspect-square bg-surface-warm overflow-hidden">
            {/* Primary image */}
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={cn(
                  'object-cover transition-all duration-slow',
                  secondaryImage && 'group-hover:opacity-0',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                unoptimized={primaryImage.url.startsWith('/images/')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-surface-border" />
              </div>
            )}

            {/* Secondary image (hover) */}
            {secondaryImage && (
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="absolute inset-0 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-slow"
                unoptimized={secondaryImage.url.startsWith('/images/')}
              />
            )}

            {/* Skeleton while loading */}
            {primaryImage && !imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}

            {/* Badge */}
            {badge && (
              <span className={cn(
                'absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm',
                badge.class
              )}>
                {badge.label}
              </span>
            )}

            {/* Action buttons */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 group-focus-within:translate-x-0">
              <button
                type="button"
                onClick={handleWishlist}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-all hover:scale-110',
                  inWishlist
                    ? 'bg-error-500 text-white'
                    : 'bg-white/90 text-muted hover:bg-white'
                )}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
              </button>
              <button
                type="button"
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-muted hover:bg-white hover:scale-110 transition-all"
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            {/* Quick add bar */}
            {product.type === 'STANDARD' && (
              <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-normal">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="w-full h-9 bg-foreground/90 backdrop-blur-sm text-white text-body-xs font-semibold rounded-lg hover:bg-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                </button>
              </div>
            )}

            {/* Customize CTA for customizable products */}
            {product.type !== 'STANDARD' && (
              <div className="absolute bottom-0 inset-x-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-normal">
                <span className="flex w-full h-9 bg-gradient-to-r from-primary-400 to-accent-coral text-white text-body-xs font-semibold rounded-lg items-center justify-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Customize Now
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-3.5">
            {/* Rating */}
            {Number(product.avgRating) > 0 && (
              <div className="flex items-center gap-1 mb-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < Math.floor(Number(product.avgRating))
                          ? 'fill-primary-400 text-primary-400'
                          : 'fill-surface-border text-surface-border'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted">({product.reviewCount})</span>
              </div>
            )}

            {/* Category */}
            {product.categories[0] && (
              <p className="text-[11px] text-primary-500 font-medium uppercase tracking-wider mb-1">
                {product.categories[0].category.name}
              </p>
            )}

            {/* Name */}
            <h3 className="text-body-sm font-medium text-foreground line-clamp-2 leading-snug mb-2 min-h-[2.5em]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-price-sm font-bold text-foreground">
                {formatPrice(displayPrice)}
              </span>
              {isOnSale && (
                <span className="text-body-xs text-muted line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

// ============ PRODUCT CARD SKELETON ============
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card" aria-hidden="true">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3.5 w-1/2 rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-5 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}
