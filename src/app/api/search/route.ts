import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Search query must be at least 2 characters.' },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        basePrice: true,
        salePrice: true,
        type: true,
        avgRating: true,
        reviewCount: true,
        images: {
          select: { url: true, alt: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: [
        { soldCount: 'desc' },
        { avgRating: 'desc' },
      ],
    });

    // Also search categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p) => ({
          ...p,
          basePrice: Number(p.basePrice),
          salePrice: p.salePrice ? Number(p.salePrice) : null,
          avgRating: Number(p.avgRating),
          image: p.images[0]?.url || null,
        })),
        categories,
        totalProducts: products.length,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
