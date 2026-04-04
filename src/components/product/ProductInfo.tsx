'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { PriceDisplay, QuantitySelector, StarRating } from '@/components/ui/PriceDisplay';
import DeliveryEstimate from '@/components/product/DeliveryEstimate';
import ProductVariants from '@/components/product/ProductVariants';
import { useCart } from '@/hooks/useCart';
import { useHydration } from '@/hooks/useHydration';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { ProductDetail, ProductVariant } from '@/types/product';

interface ProductInfoProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
}

const PRODUCT_TYPE_LABELS: Record<ProductDetail['type'], string> = {
  STANDARD: 'Ready to Order',
  CUSTOMIZABLE_PHONE_COVER: 'Custom Phone Cover',
  CUSTOMIZABLE_FRAME: 'Custom Frame',
  CUSTOMIZABLE_OTHER: 'Custom Gift',
};

export default function ProductInfo({ product, selectedVariant, onVariantChange }: ProductInfoProps) {
  const router = useRouter();
  const hydrated = useHydration();
  const { addToCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  const inWishlist = hydrated ? isInWishlist(product.id) : false;
  const effectiveBasePrice = selectedVariant?.price ?? product.basePrice;
  const effectiveSalePrice = selectedVariant?.price ? null : product.salePrice;
  const stockCount = selectedVariant?.stock ?? 99;
  const isOutOfStock = selectedVariant ? selectedVariant.stock < 1 : false;
  const showStockCount = product.variants.length > 0;

  const featureHighlights = useMemo(() => {
    const items = ['Premium finishing', 'Islandwide delivery', 'Secure checkout'];

    if (product.customizationConfig) {
      items.unshift('Custom design support');
    }

    return items;
  }, [product.customizationConfig]);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This variant is currently out of stock.');
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
      designId: null,
      name: product.name,
      price: effectiveBasePrice,
      salePrice: effectiveSalePrice,
      image: selectedVariant?.image ?? product.images[0]?.url ?? '',
      variantName: selectedVariant?.name ?? null,
      slug: product.slug,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleItem(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-body-xs font-semibold text-primary-700">
            {PRODUCT_TYPE_LABELS[product.type]}
          </span>
          {product.isBestSeller && (
            <span className="rounded-full bg-accent-gold/15 px-3 py-1 text-body-xs font-semibold text-accent-gold-dark">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-secondary-50 px-3 py-1 text-body-xs font-semibold text-secondary-700">
              New Arrival
            </span>
          )}
        </div>

        <div>
          <h1 className="text-display-lg font-display text-foreground md:text-[2.5rem]">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-muted">
            <StarRating rating={product.avgRating} showValue showCount count={product.reviewCount} />
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.soldCount > 0 && <span>{product.soldCount}+ sold</span>}
          </div>
        </div>

        {product.shortDescription && (
          <p className="max-w-2xl text-body-lg leading-7 text-muted">{product.shortDescription}</p>
        )}
      </div>

      <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <PriceDisplay price={effectiveBasePrice} salePrice={effectiveSalePrice} size="lg" />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-body-sm">
          <span className={isOutOfStock ? 'text-error-600 font-semibold' : 'text-success-600 font-semibold'}>
            {isOutOfStock ? 'Out of stock' : 'In stock'}
          </span>
          {showStockCount && !isOutOfStock && (
            <span className="text-muted">• {stockCount} item(s) available</span>
          )}
          {!showStockCount && <span className="text-muted">• Carefully packed and ready to dispatch</span>}
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
          <ProductVariants
            variants={product.variants}
            selectedVariantId={selectedVariant?.id ?? null}
            onVariantChange={onVariantChange}
          />
        </div>
      )}

      <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-body-sm font-semibold text-foreground">Quantity</p>
            <p className="text-body-xs text-muted">Adjust your order before adding it to cart.</p>
          </div>
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            max={showStockCount ? Math.max(1, stockCount) : 10}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
          >
            Add to Cart
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            leftIcon={<Zap className="h-4 w-4" />}
          >
            Buy Now
          </Button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleWishlistToggle}
            leftIcon={<Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />}
          >
            {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </Button>

          {product.customizationConfig ? (
            <Link href={`/checkout?product=${product.slug}&customize=1`} className="block">
              <Button type="button" variant="outline" fullWidth leftIcon={<Sparkles className="h-4 w-4" />}>
                Customize & Order
              </Button>
            </Link>
          ) : (
            <div className="rounded-md border border-surface-border bg-surface-card px-4 py-3 text-body-sm text-muted">
              Need help? Contact our team for bulk or gift packaging support.
            </div>
          )}
        </div>
      </div>

      {product.customizationConfig && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary-600" />
            <div>
              <h3 className="text-body-md font-semibold text-foreground">Customization available</h3>
              <p className="mt-1 text-body-sm text-muted">
                Upload up to {product.customizationConfig.maxImages} image(s)
                {product.customizationConfig.allowText ? ` and add personalized text up to ${product.customizationConfig.maxTextLength} characters.` : '.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <DeliveryEstimate amount={(effectiveSalePrice ?? effectiveBasePrice) * quantity} />

      <div className="grid gap-3 rounded-2xl border border-surface-border bg-white p-4 shadow-card sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <PackageCheck className="mt-0.5 h-4 w-4 text-primary-500" />
          <div>
            <p className="text-body-sm font-semibold text-foreground">Premium Packing</p>
            <p className="text-body-xs text-muted">Securely wrapped for gifting and shipping.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary-500" />
          <div>
            <p className="text-body-sm font-semibold text-foreground">Quality Promise</p>
            <p className="text-body-xs text-muted">Every order is checked before dispatch.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary-500" />
          <div>
            <p className="text-body-sm font-semibold text-foreground">Why shoppers love it</p>
            <p className="text-body-xs text-muted">{featureHighlights.join(' • ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
