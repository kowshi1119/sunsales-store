import { Prisma, ProductType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { adminProductSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const PRODUCT_TYPES = new Set(Object.values(ProductType));

function serializeAdminProduct(product: {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  basePrice: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  isActive: boolean;
  isFeatured: boolean;
  soldCount: number;
  createdAt: Date;
  images: Array<{ url: string }>;
  variants: Array<{ stock: number }>;
}) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
    soldCount: product.soldCount,
    imageUrl: product.images[0]?.url ?? null,
    createdAt: product.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '10') || 10));
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.toLowerCase() ?? 'all';
    const typeParam = searchParams.get('type');
    const type = typeParam && PRODUCT_TYPES.has(typeParam as ProductType)
      ? (typeParam as ProductType)
      : undefined;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (type) {
      where.type = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          basePrice: true,
          salePrice: true,
          isActive: true,
          isFeatured: true,
          soldCount: true,
          createdAt: true,
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
            select: { url: true },
          },
          variants: {
            where: { isActive: true },
            select: { stock: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(serializeAdminProduct),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load products.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
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
        OR: [
          { slug: normalizedSlug },
          ...(normalizedSku ? [{ sku: normalizedSku }] : []),
        ],
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: 'A product with the same slug or SKU already exists.' },
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

    const product = await prisma.product.create({
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
          create: uniqueCategoryIds.map((categoryId) => ({ categoryId })),
        },
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            alt: data.name.trim(),
            sortOrder: index,
          })),
        },
        ...(data.stock > 0 || normalizedSku
          ? {
              variants: {
                create: [{
                  name: 'Default',
                  sku: normalizedSku,
                  stock: data.stock,
                  isActive: true,
                  attributes: {},
                }],
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully.',
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin product create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create product.' }, { status: 500 });
  }
}
