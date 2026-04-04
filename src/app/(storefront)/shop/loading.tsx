import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { ProductGridSkeleton } from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }]} />

        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        <div className="mb-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-28 rounded-full" />
          ))}
        </div>

        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
