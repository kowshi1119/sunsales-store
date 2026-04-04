import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  designId: z.string().nullable().optional(),
});

const updateCartSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

// GET — fetch user cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const items = await prisma.cartItem.findMany({
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
            isActive: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true, sortOrder: true },
            },
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            attributes: true,
            image: true,
            isActive: true,
          },
        },
      },
    });

    const serialized = items
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        designId: item.designId,
        product: {
          ...item.product,
          basePrice: Number(item.product.basePrice),
          salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
        },
        variant: item.variant
          ? {
              ...item.variant,
              price: item.variant.price ? Number(item.variant.price) : null,
            }
          : null,
      }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart.' },
      { status: 500 }
    );
  }
}

// POST — add item to cart
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
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity, designId } = parsed.data;

    // Check product exists and is active
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Product not found or unavailable.' },
        { status: 404 }
      );
    }

    // Check for an existing cart line before validating stock so totals stay accurate.
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: variantId || null,
        designId: designId || null,
      },
    });

    // Check stock if variant specified
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { success: false, message: 'Selected variant is unavailable.' },
          { status: 404 }
        );
      }

      const requestedQuantity = (existing?.quantity ?? 0) + quantity;
      if (variant.stock < requestedQuantity) {
        return NextResponse.json(
          { success: false, message: `Only ${variant.stock} items available for this variant.` },
          { status: 400 }
        );
      }
    }

    // Upsert cart item
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          quantity,
          designId: designId || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Added to cart.',
    });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to cart.' },
      { status: 500 }
    );
  }
}

// PUT — update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 }
      );
    }

    const { itemId, quantity } = parsed.data;

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.user.id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found.' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, message: 'Item removed from cart.' });
    }

    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });

      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { success: false, message: 'Selected variant is unavailable.' },
          { status: 404 }
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { success: false, message: `Only ${variant.stock} items available for this variant.` },
          { status: 400 }
        );
      }
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart.' },
      { status: 500 }
    );
  }
}

// DELETE — clear cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear cart.' },
      { status: 500 }
    );
  }
}
