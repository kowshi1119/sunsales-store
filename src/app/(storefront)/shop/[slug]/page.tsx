import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { Package, ShieldCheck, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductReviews from '@/components/product/ProductReviews';
import RelatedProducts from '@/components/product/RelatedProducts';
import { generateBreadcrumbSchema, generateMetadata as buildMetadata, generateProductSchema } from '@/lib/seo';
import prisma from '@/lib/prisma';
import type { ProductDetail, ProductListItem, ProductVariant } from '@/types/product';

export const dynamic = 'force-dynamic';

function normalizeAttributes(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item)])
  );
}

async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: { name: 'asc' } },
      categories: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, avatar: true } },
        },
      },
      customizationConfig: true,
      model3d: true,
      images360: { orderBy: { frameIndex: 'asc' } },
    },
  });

  if (!product) {
    return null;
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    avgRating: Number(product.avgRating),
    weight: product.weight ? Number(product.weight) : null,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : null,
      attributes: normalizeAttributes(variant.attributes),
    })) as ProductVariant[],
    reviews: product.reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      user: {
        fullName: review.user.fullName,
        avatar: review.user.avatar,
      },
    })),
    customizationConfig: product.customizationConfig
      ? {
          ...product.customizationConfig,
          mockupImages: product.customizationConfig.mockupImages,
        }
      : null,
    model3d: product.model3d
      ? {
          ...product.model3d,
        }
      : null,
    images360: product.images360,
  } as ProductDetail;
}

async function getRelatedProducts(productId: string, categoryId?: string): Promise<ProductListItem[]> {
  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      ...(categoryId
        ? {
            categories: {
              some: { categoryId },
            },
          }
        : {}),
    },
    orderBy: [
      { isBestSeller: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      type: true,
      basePrice: true,
      salePrice: true,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      avgRating: true,
      reviewCount: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 2,
        select: { id: true, url: true, alt: true, sortOrder: true },
      },
      categories: {
        select: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return products.map((item) => ({
    ...item,
    basePrice: Number(item.basePrice),
    salePrice: item.salePrice ? Number(item.salePrice) : null,
    avgRating: Number(item.avgRating),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, isActive: true },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!product) {
    return buildMetadata({
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
      url: `/shop/${params.slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description.slice(0, 150),
    image: product.images[0]?.url || '/images/og-default.jpg',
    url: `/shop/${product.slug}`,
    type: 'product',
  });
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = product.categories[0]?.category;
  const relatedProducts = await getRelatedProducts(product.id, primaryCategory?.id);

  const productSchema = generateProductSchema({
    name: product.name,
    description: product.shortDescription || product.description,
    price: product.basePrice,
    salePrice: product.salePrice,
    image: product.images[0]?.url || '/images/og-default.jpg',
    slug: product.slug,
    avgRating: product.avgRating,
    reviewCount: product.reviewCount,
    inStock: product.variants.length > 0 ? product.variants.some((variant) => variant.stock > 0) : true,
    sku: product.sku,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Shop', url: '/shop' },
    ...(primaryCategory ? [{ name: primaryCategory.name, url: `/shop?category=${primaryCategory.slug}` }] : []),
    { name: product.name, url: `/shop/${product.slug}` },
  ]);

  return (
    <div className="bg-surface min-h-screen">
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Script id="product-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container-custom py-6 md:py-10 space-y-8 md:space-y-10">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            ...(primaryCategory ? [{ label: primaryCategory.name, href: `/shop?category=${primaryCategory.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <ProductDetailView product={product} />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
            <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Product Details</p>
            <h2 className="mt-1 text-display-md font-display text-foreground">Why this item stands out</h2>
            <div className="mt-4 whitespace-pre-line text-body-md leading-7 text-muted">
              {product.description}
            </div>

            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/shop?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-surface-card px-3 py-1 text-body-xs font-medium text-muted transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
              <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Store Promise</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary-500" />
                  <div>
                    <h3 className="text-body-md font-semibold text-foreground">Premium finish</h3>
                    <p className="text-body-sm text-muted">Designed for gifting, display, and everyday delight with carefully selected materials.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 text-primary-500" />
                  <div>
                    <h3 className="text-body-md font-semibold text-foreground">Islandwide delivery</h3>
                    <p className="text-body-sm text-muted">Reliable shipping across Sri Lanka with packing that protects your order in transit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary-500" />
                  <div>
                    <h3 className="text-body-md font-semibold text-foreground">Secure checkout</h3>
                    <p className="text-body-sm text-muted">Shop with confidence using a protected checkout flow and clear order updates.</p>
                  </div>
                </div>
              </div>
            </div>

            {primaryCategory && (
              <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Browse Similar</p>
                <h3 className="mt-1 text-body-xl font-semibold text-foreground">Explore more in {primaryCategory.name}</h3>
                <p className="mt-2 text-body-sm text-muted">Discover matching pieces and gift-ready favorites from the same collection.</p>
                <Link href={`/shop?category=${primaryCategory.slug}`} className="mt-4 inline-flex text-body-sm font-semibold text-primary-600 hover:text-primary-700">
                  View category →
                </Link>
              </div>
            )}
          </div>
        </section>

        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          reviews={product.reviews}
          avgRating={product.avgRating}
          reviewCount={product.reviewCount}
        />

        <RelatedProducts products={relatedProducts} categoryName={primaryCategory?.name} />
      </div>
    </div>
  );
}
