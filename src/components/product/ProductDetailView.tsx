'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import type { ProductDetail, ProductVariant } from '@/types/product';

interface ProductDetailViewProps {
  product: ProductDetail;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const initialVariant = useMemo<ProductVariant | null>(
    () => product.variants.find((variant) => variant.stock > 0) ?? product.variants[0] ?? null,
    [product.variants]
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialVariant);

  useEffect(() => {
    setSelectedVariant(initialVariant);
  }, [initialVariant]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <ProductGallery
        images={product.images}
        productName={product.name}
        selectedVariantImage={selectedVariant?.image ?? null}
      />
      <ProductInfo
        product={product}
        selectedVariant={selectedVariant}
        onVariantChange={setSelectedVariant}
      />
    </div>
  );
}
