import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productFilterSchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const getParam = (key: string) => {
      const value = searchParams.get(key);
      return value === null || value === '' ? undefined : value;
    };

    const parsed = productFilterSchema.safeParse({
      page: getParam('page'),
      limit: getParam('limit'),
      search: getParam('search'),
      category: getParam('category'),
      type: getParam('type'),
      minPrice: getParam('minPrice'),
      maxPrice: getParam('maxPrice'),
      minRating: getParam('minRating'),
      sort: getParam('sort'),
      featured: getParam('featured'),
      bestSeller: getParam('bestSeller'),
      newArrival: getParam('newArrival'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid filter parameters.' },
        { status: 400 }
      );
    }

    const { page, limit, search, category, type, minPrice, maxPrice, minRating, sort, featured, bestSeller, newArrival } = parsed.data;
    const categorySlugs = category
      ? category.split(',').map((value) => value.trim()).filter(Boolean)
      : [];

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    if (categorySlugs.length > 0) {
      where.categories = {
        some: {
          category: { slug: { in: categorySlugs } },
        },
      };
    }

    if (type) where.type = type;
    if (minRating !== undefined) where.avgRating = { gte: minRating };
    if (featured) where.isFeatured = true;
    if (bestSeller) where.isBestSeller = true;
    if (newArrival) where.isNewArrival = true;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'popular':
        orderBy = { soldCount: 'desc' };
        break;
      case 'rating':
        orderBy = { avgRating: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Serialize Decimal fields
    const serialized = products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      avgRating: Number(p.avgRating),
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: serialized,
        total,
        page,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}
