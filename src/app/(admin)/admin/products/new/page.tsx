import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import prisma from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create Product',
  description: 'Add a new product to the Sun Sales catalog.',
  url: '/admin/products/new',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

async function getCategoryOptions() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        parent: {
          select: { name: true },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.parent ? `${category.parent.name} → ${category.name}` : category.name,
      slug: category.slug,
    }));
  } catch {
    return [];
  }
}

export default async function NewAdminProductPage() {
  const categories = await getCategoryOptions();

  return (
    <AdminShell
      title="New product"
      description="Add a catalog item with pricing, categories, media, and storefront visibility settings."
    >
      <ProductForm mode="create" categories={categories} />
    </AdminShell>
  );
}
