import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Package } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductCard from '@/components/product/ProductCard';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import Button from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import { CATEGORY_CONTENT } from '@/lib/site-content';
import type { ProductListItem } from '@/types/product';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

interface CategoryViewModel {
  id: string;
  name: string;
  slug: string;
  description: string;
  children: Array<{ id: string; name: string; slug: string }>;
  highlights: string[];
}

async function getCategoryData(slug: string): Promise<{
  category: CategoryViewModel;
  products: ProductListItem[];
  hasLiveCatalog: boolean;
} | null> {
  const fallback = CATEGORY_CONTENT[slug];

  if (!process.env.DATABASE_URL) {
    if (!fallback) return null;

    return {
      category: {
        id: slug,
        name: fallback.name,
        slug,
        description: fallback.description,
        children: [],
        highlights: fallback.highlights,
      },
      products: [],
      hasLiveCatalog: false,
    };
  }

  try {
    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true },
        },
        products: {
          where: { product: { isActive: true } },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 2 },
                categories: {
                  include: {
                    category: {
                      select: { id: true, name: true, slug: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      if (!fallback) return null;

      return {
        category: {
          id: slug,
          name: fallback.name,
          slug,
          description: fallback.description,
          children: [],
          highlights: fallback.highlights,
        },
        products: [],
        hasLiveCatalog: false,
      };
    }

    const products: ProductListItem[] = category.products.map(({ product }) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      type: product.type,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      avgRating: Number(product.avgRating),
      reviewCount: product.reviewCount,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder,
      })),
      categories: product.categories.map((item) => ({
        category: {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
        },
      })),
    }));

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? fallback?.description ?? `Browse the ${category.name} collection at Sun Sales.`,
        children: category.children,
        highlights: fallback?.highlights ?? ['Premium quality', 'Islandwide delivery', 'Gift-ready presentation'],
      },
      products,
      hasLiveCatalog: true,
    };
  } catch {
    if (!fallback) return null;

    return {
      category: {
        id: slug,
        name: fallback.name,
        slug,
        description: fallback.description,
        children: [],
        highlights: fallback.highlights,
      },
      products: [],
      hasLiveCatalog: false,
    };
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const data = await getCategoryData(params.slug);

  if (!data) {
    return {
      title: 'Category Not Found | Sun Sales',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${data.category.name} | Sun Sales`,
    description: data.category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const data = await getCategoryData(params.slug);

  if (!data) {
    notFound();
  }

  const { category, products, hasLiveCatalog } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: category.name }]} />

        <AnimatedSection>
          <div className="mb-8 rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Category</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">{category.name}</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">{category.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {category.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-body-xs font-medium text-primary-700"
                >
                  {highlight}
                </span>
              ))}
            </div>

            {!hasLiveCatalog && (
              <p className="mt-4 rounded-2xl bg-accent-cream/60 px-4 py-3 text-body-sm text-foreground">
                The live catalog is not connected in this environment yet, but this route now works and you can still browse the full storefront.
              </p>
            )}
          </div>
        </AnimatedSection>

        {category.children.length > 0 && (
          <AnimatedSection delay={80}>
            <div className="mb-8 flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="rounded-full border border-surface-border bg-white px-4 py-2 text-body-sm font-medium text-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <AnimatedSection key={product.id} delay={index * 40}>
                <ProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection delay={120}>
            <div className="rounded-3xl border border-dashed border-surface-border bg-white px-6 py-14 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-display-sm font-display text-foreground">New arrivals are on the way</h2>
              <p className="mx-auto mt-3 max-w-2xl text-body-md text-muted">
                We are preparing this category for launch. In the meantime, explore the main shop or contact our team for a curated recommendation.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/shop">
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Browse all products</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Talk to our team</Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
