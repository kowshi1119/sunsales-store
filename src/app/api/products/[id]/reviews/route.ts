import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reviewSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const createReviewSchema = reviewSchema.extend({
  images: z.array(z.string()).max(3).optional().default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Please log in to submit a review.' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        isActive: true,
      },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid review payload.',
        },
        { status: 400 }
      );
    }

    const hasOrderedProduct = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id,
        },
      },
      select: { id: true },
    });

    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id,
        },
      },
      update: {
        rating: parsed.data.rating,
        title: parsed.data.title?.trim() || null,
        comment: parsed.data.comment.trim(),
        images: parsed.data.images,
        isVerified: Boolean(hasOrderedProduct),
        isApproved: true,
      },
      create: {
        userId: session.user.id,
        productId: product.id,
        rating: parsed.data.rating,
        title: parsed.data.title?.trim() || null,
        comment: parsed.data.comment.trim(),
        images: parsed.data.images,
        isVerified: Boolean(hasOrderedProduct),
        isApproved: true,
      },
    });

    const stats = await prisma.review.aggregate({
      where: {
        productId: product.id,
        isApproved: true,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count._all,
      },
    });

    return NextResponse.json({
      success: true,
      message: existingReview ? 'Your review has been updated.' : 'Thanks for sharing your review!',
    });
  } catch (error) {
    console.error('Create review API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review.' },
      { status: 500 }
    );
  }
}
