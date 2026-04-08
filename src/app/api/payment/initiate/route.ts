import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePayHereCheckout, getPayHereCheckoutUrl } from '@/lib/payment';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: {
        user: {
          select: { email: true, fullName: true, phone: true },
        },
        address: {
          select: { fullName: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentMethod !== PaymentMethod.PAYHERE) {
      return NextResponse.json({ success: false, message: 'This order does not require a PayHere payment.' }, { status: 400 });
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ success: false, message: 'This order has already been paid.' }, { status: 400 });
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
      return NextResponse.json({ success: false, message: 'This order is no longer payable.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const params = generatePayHereCheckout({
      orderId: order.orderNumber,
      amount: Number(order.total),
      currency: order.currency,
      customerName: order.address.fullName || order.user.fullName,
      customerEmail: order.user.email,
      customerPhone: order.address.phone || order.user.phone,
      description: `Sun Sales order ${order.orderNumber}`,
      returnUrl: `${siteUrl}/checkout/confirmation?order=${encodeURIComponent(order.orderNumber)}`,
      cancelUrl: `${siteUrl}/checkout?cancelled=true&order=${encodeURIComponent(order.orderNumber)}`,
      notifyUrl: `${siteUrl}/api/payment/callback`,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: getPayHereCheckoutUrl(),
        params,
      },
    });
  } catch (error) {
    console.error('Payment initiate error:', error);
    return NextResponse.json({ success: false, message: 'Failed to initialize PayHere checkout.' }, { status: 500 });
  }
}
