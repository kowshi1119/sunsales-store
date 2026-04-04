import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { couponValidateSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to apply coupons.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid coupon code.' },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code.' },
        { status: 404 }
      );
    }

    // Check active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'This coupon is no longer active.' },
        { status: 400 }
      );
    }

    // Check dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json(
        { success: false, message: 'This coupon has expired.' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'This coupon has reached its usage limit.' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      return NextResponse.json(
        { success: false, message: `Minimum order amount of Rs. ${minAmount.toLocaleString()} required.` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    const couponValue = Number(coupon.value);

    switch (coupon.type) {
      case 'PERCENTAGE':
        discount = (subtotal * couponValue) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }
        break;
      case 'FIXED_AMOUNT':
        discount = Math.min(couponValue, subtotal);
        break;
      case 'FREE_SHIPPING':
        discount = 0; // Handled at checkout
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon applied!',
      data: {
        code: coupon.code,
        type: coupon.type,
        discount: Math.round(discount * 100) / 100,
        freeShipping: coupon.type === 'FREE_SHIPPING',
        description:
          coupon.type === 'PERCENTAGE'
            ? `${couponValue}% off`
            : coupon.type === 'FIXED_AMOUNT'
              ? `Rs. ${couponValue} off`
              : 'Free shipping',
      },
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate coupon.' },
      { status: 500 }
    );
  }
}
