import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const toggleWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            type: true,
            avgRating: true,
            reviewCount: true,
            isActive: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { url: true, alt: true },
            },
          },
        },
      },
    });

    const serialized = items
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.product.id,
        createdAt: item.createdAt.toISOString(),
        product: {
          ...item.product,
          basePrice: Number(item.product.basePrice),
          salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
          avgRating: Number(item.product.avgRating),
        },
      }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = toggleWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    // Check product exists and is active
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Product not found or unavailable.' },
        { status: 404 }
      );
    }

    // Toggle: if exists, remove; if not, add
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId: session.user.id, productId },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({
        success: true,
        message: 'Removed from wishlist.',
        data: { action: 'removed' },
      });
    }

    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist.',
      data: { action: 'added' },
    });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update wishlist.' },
      { status: 500 }
    );
  }
}
