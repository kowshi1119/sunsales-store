import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Support lookup by both ID and slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
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
          take: 10,
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
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // Serialize Decimal fields
    const serialized = {
      ...product,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      avgRating: Number(product.avgRating),
      weight: product.weight ? Number(product.weight) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
      reviews: product.reviews.map((r) => ({
        ...r,
        user: { fullName: r.user.fullName, avatar: r.user.avatar },
      })),
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Product detail API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product.' },
      { status: 500 }
    );
  }
}
