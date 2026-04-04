import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCard';
import type { ProductListItem } from '@/types/product';

interface ProductGridProps {
  products: ProductListItem[];
  className?: string;
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
