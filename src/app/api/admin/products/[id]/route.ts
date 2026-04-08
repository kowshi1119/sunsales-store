import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { adminProductSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  type: string;
  basePrice: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  sku: string | null;
  weight: Prisma.Decimal | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  images?: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
  categories?: Array<{ categoryId: string; category: { id: string; name: string; slug: string } }>;
  variants?: Array<{ id: string; name: string; sku: string | null; stock: number; price: Prisma.Decimal | null; isActive: boolean }>;
}) {
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
    weight: product.weight ? Number(product.weight) : null,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    tags: product.tags,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    stock: (product.variants ?? []).reduce((total, variant) => total + variant.stock, 0),
    images: product.images ?? [],
    categories: product.categories ?? [],
    variants: (product.variants ?? []).map((variant) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : null,
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        variants: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeProduct(product) });
  } catch (error) {
    console.error('Admin product detail error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch product.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = adminProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please correct the highlighted product fields.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedSlug = data.slug.trim().toLowerCase();
    const normalizedSku = data.sku?.trim() || null;
    const normalizedSalePrice = body.salePrice === '' || body.salePrice === null || body.salePrice === undefined
      ? null
      : Number(data.salePrice) > 0
        ? Number(data.salePrice)
        : null;
    const normalizedWeight = body.weight === '' || body.weight === null || body.weight === undefined
      ? null
      : Number(data.weight);
    const uniqueCategoryIds = Array.from(new Set(data.categoryIds));
    const imageUrls = Array.from(new Set((data.imageUrls ?? []).map((url) => url.trim()).filter(Boolean)));

    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: params.id },
        OR: [
          { slug: normalizedSlug },
          ...(normalizedSku ? [{ sku: normalizedSku }] : []),
        ],
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: 'Another product already uses that slug or SKU.' },
        { status: 409 }
      );
    }

    const categoryCount = await prisma.category.count({
      where: { id: { in: uniqueCategoryIds }, isActive: true },
    });

    if (categoryCount !== uniqueCategoryIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more selected categories are invalid.' },
        { status: 400 }
      );
    }

    const defaultVariant = existing.variants.find((variant) => variant.name === 'Default');

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name.trim(),
        slug: normalizedSlug,
        description: data.description.trim(),
        shortDescription: data.shortDescription?.trim() || null,
        type: data.type,
        basePrice: Number(data.basePrice),
        salePrice: normalizedSalePrice,
        sku: normalizedSku,
        weight: normalizedWeight,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        tags: data.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        categories: {
          deleteMany: {},
          create: uniqueCategoryIds.map((categoryId) => ({ categoryId })),
        },
        images: {
          deleteMany: {},
          create: imageUrls.map((url, index) => ({
            url,
            alt: data.name.trim(),
            sortOrder: index,
          })),
        },
        ...(defaultVariant
          ? {
              variants: {
                update: {
                  where: { id: defaultVariant.id },
                  data: {
                    sku: normalizedSku,
                    stock: data.stock,
                    price: normalizedSalePrice,
                    isActive: true,
                  },
                },
              },
            }
          : existing.variants.length === 0 && (data.stock > 0 || normalizedSku)
            ? {
                variants: {
                  create: [{
                    name: 'Default',
                    sku: normalizedSku,
                    stock: data.stock,
                    price: normalizedSalePrice,
                    isActive: true,
                    attributes: {},
                  }],
                },
              }
            : {}),
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true, isActive: true } });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: !existing.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: updated.isActive ? 'Product restored successfully.' : 'Product deactivated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update product status.' }, { status: 500 });
  }
}
