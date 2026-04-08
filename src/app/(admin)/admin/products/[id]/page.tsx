import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import prisma from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';

interface AdminEditProductPageProps {
  params: {
    id: string;
  };
}

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

async function getEditableProduct(id: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: {
          select: {
            categoryId: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            stock: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      type: product.type,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      sku: product.sku,
      stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
      weight: product.weight ? Number(product.weight) : null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      tags: product.tags,
      categoryIds: product.categories.map((category) => category.categoryId),
      imageUrls: product.images.map((image) => image.url),
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: AdminEditProductPageProps): Promise<Metadata> {
  return buildMetadata({
    title: `Edit Product ${params.id}`,
    description: 'Update a catalog item from the Sun Sales admin workspace.',
    url: `/admin/products/${params.id}`,
    noIndex: true,
  });
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const [categories, product] = await Promise.all([
    getCategoryOptions(),
    getEditableProduct(params.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit product"
      description="Update product details, pricing, SEO, and gallery media."
    >
      <ProductForm mode="edit" categories={categories} product={product} />
    </AdminShell>
  );
}
