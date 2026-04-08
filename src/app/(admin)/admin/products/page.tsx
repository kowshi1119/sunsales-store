import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import ProductCatalogManager from '@/components/admin/ProductCatalogManager';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Admin Products',
  description: 'Create, edit, and manage the Sun Sales catalog from one workspace.',
  url: '/admin/products',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  return (
    <AdminShell
      title="Product management"
      description="Create new catalog items, refine pricing, and keep storefront visibility in sync."
    >
      <ProductCatalogManager />
    </AdminShell>
  );
}
