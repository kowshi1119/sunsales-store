import { AuditAction, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuditLog, getClientIp } from '@/lib/audit';
import {
  adminNewOrderTemplate,
  orderConfirmationTemplate,
  sendEmail,
} from '@/lib/email';
import {
  formatPaymentMethodLabel,
  generateUniqueOrderNumber,
  getShippingQuote,
  resolveCheckoutItems,
  serializeOrder,
  validateCouponForOrder,
} from '@/lib/orders';
import prisma from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit') ?? '10') || 10));
    const status = searchParams.get('status')?.trim() || undefined;
    const isValidStatus = status ? Object.values(OrderStatus).includes(status as OrderStatus) : false;

    const where = {
      userId: session.user.id,
      ...(status && status !== 'all' && isValidStatus ? { status: status as OrderStatus } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              designId: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              productName: true,
              productImage: true,
              variantName: true,
            },
          },
          address: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              district: true,
              province: true,
              postalCode: true,
              country: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(serializeOrder),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load your orders.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Please review your checkout details.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, fullName: true, phone: true, isActive: true },
    });

    if (!user?.isActive) {
      return NextResponse.json({ success: false, message: 'Your account is not active.' }, { status: 403 });
    }

    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId: session.user.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        province: true,
        postalCode: true,
        country: true,
      },
    });

    if (!address) {
      return NextResponse.json({ success: false, message: 'Please select a valid delivery address.' }, { status: 404 });
    }

    const { lines, subtotal } = await resolveCheckoutItems(session.user.id, data.items);
    const appliedCoupon = await validateCouponForOrder({
      code: data.couponCode,
      subtotal,
      userId: session.user.id,
    });

    const shippingQuote = await getShippingQuote(address.district, subtotal);
    const shippingCost = appliedCoupon?.freeShipping ? 0 : shippingQuote.cost;
    const discount = appliedCoupon?.discount ?? 0;
    const tax = 0;
    const total = Math.max(0, Math.round((subtotal + shippingCost + tax - discount) * 100) / 100);
    const orderNumber = await generateUniqueOrderNumber();
    const isPayHere = data.paymentMethod === 'PAYHERE';
    const paymentMethod = isPayHere ? PaymentMethod.PAYHERE : PaymentMethod.CASH_ON_DELIVERY;
    const orderStatus = isPayHere ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
    const ipAddress = getClientIp(request.headers);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          addressId: address.id,
          subtotal,
          shippingCost,
          discount,
          tax,
          total,
          status: orderStatus,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod,
          couponCode: appliedCoupon?.code ?? null,
          notes: data.notes?.trim() || null,
          giftMessage: data.giftMessage?.trim() || null,
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              designId: line.designId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: line.lineTotal,
              productName: line.productName,
              productImage: line.productImage,
              variantName: line.variantName,
            })),
          },
          statusHistory: {
            create: [
              {
                status: OrderStatus.PENDING,
                note: 'Order placed successfully.',
                changedBy: session.user.id,
              },
              ...(!isPayHere
                ? [{
                    status: OrderStatus.CONFIRMED,
                    note: 'Cash on delivery order confirmed.',
                    changedBy: session.user.id,
                  }]
                : []),
            ],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          address: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              district: true,
              province: true,
              postalCode: true,
              country: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              designId: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              productName: true,
              productImage: true,
              variantName: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              status: true,
              note: true,
              changedBy: true,
              createdAt: true,
            },
          },
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (!isPayHere) {
        for (const line of lines) {
          if (line.variantId) {
            await tx.productVariant.update({
              where: { id: line.variantId },
              data: { stock: { decrement: line.quantity } },
            });
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { soldCount: { increment: line.quantity } },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

      return created;
    });

    await createAuditLog({
      userId: session.user.id,
      action: AuditAction.CREATE,
      entity: 'Order',
      entityId: order.id,
      ipAddress,
      details: {
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        total: Number(order.total),
      },
    });

    const orderItemsForEmail = order.items.map((item) => ({
      name: item.variantName ? `${item.productName} (${item.variantName})` : item.productName,
      quantity: item.quantity,
      price: `LKR ${Number(item.totalPrice).toFixed(2)}`,
    }));

    await sendEmail({
      to: order.user.email,
      subject: `Sun Sales order ${order.orderNumber}`,
      html: orderConfirmationTemplate({
        orderNumber: order.orderNumber,
        customerName: order.user.fullName,
        total: `LKR ${Number(order.total).toFixed(2)}`,
        items: orderItemsForEmail,
      }),
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'hello@sunsales.lk',
      subject: `New order received — ${order.orderNumber}`,
      html: adminNewOrderTemplate({
        orderNumber: order.orderNumber,
        customerName: order.user.fullName,
        customerEmail: order.user.email,
        total: `LKR ${Number(order.total).toFixed(2)}`,
        paymentMethod: formatPaymentMethodLabel(order.paymentMethod),
        items: orderItemsForEmail,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: isPayHere ? 'Order created. Continue to PayHere to complete payment.' : 'Order placed successfully.',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          estimatedDelivery: shippingQuote.estimatedDays,
          paymentRequired: isPayHere,
          order: serializeOrder(order),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Orders POST error:', error);

    const message = error instanceof Error ? error.message : 'Failed to create your order.';
    const status = error instanceof Error ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}
