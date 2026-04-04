import ProductCard from '@/components/product/ProductCard';
import type { ProductListItem } from '@/types/product';

interface RelatedProductsProps {
  products: ProductListItem[];
  categoryName?: string;
}

export default function RelatedProducts({ products, categoryName }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
      <div className="mb-5">
        <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">You may also like</p>
        <h2 className="mt-1 text-display-md font-display text-foreground">
          {categoryName ? `More from ${categoryName}` : 'Related Products'}
        </h2>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-full grid-flow-col auto-cols-[78%] gap-4 sm:auto-cols-[48%] lg:auto-cols-[32%] xl:auto-cols-[24%] md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
