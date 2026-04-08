import { AuditAction, OrderStatus, PaymentStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit';
import { orderConfirmationTemplate, sendEmail } from '@/lib/email';
import { getPayHereStatus, verifyPayHereCallback } from '@/lib/payment';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const params = new URLSearchParams(rawBody);

    const merchantId = params.get('merchant_id') ?? '';
    const orderNumber = params.get('order_id') ?? '';
    const amount = params.get('payhere_amount') ?? '0';
    const currency = params.get('payhere_currency') ?? 'LKR';
    const statusCode = params.get('status_code') ?? '';
    const md5sig = params.get('md5sig') ?? '';
    const paymentId = params.get('payment_id') ?? null;

    if (!merchantId || !orderNumber || !statusCode || !md5sig) {
      return NextResponse.json({ success: false, message: 'Invalid callback payload.' }, { status: 400 });
    }

    const signatureIsValid = verifyPayHereCallback({
      merchant_id: merchantId,
      order_id: orderNumber,
      payhere_amount: amount,
      payhere_currency: currency,
      status_code: statusCode,
      md5sig,
    });

    if (!signatureIsValid) {
      await createAuditLog({
        action: AuditAction.PAYMENT_RECEIVED,
        entity: 'Order',
        entityId: null,
        details: { orderNumber, statusCode, reason: 'Invalid PayHere signature' },
      });

      return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          select: {
            productId: true,
            variantId: true,
            quantity: true,
            productName: true,
            variantName: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (Math.abs(Number(amount) - Number(order.total)) > 0.01) {
      return NextResponse.json({ success: false, message: 'Payment amount mismatch.' }, { status: 400 });
    }

    const status = getPayHereStatus(statusCode);

    if (status === 'success') {
      if (order.paymentStatus !== PaymentStatus.PAID) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.PAID,
              status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status,
              paymentRef: paymentId,
            },
          });

          if (order.status === OrderStatus.PENDING) {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: OrderStatus.CONFIRMED,
                note: 'Payment confirmed via PayHere.',
                changedBy: order.userId,
              },
            });
          }

          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              });
            }

            await tx.product.update({
              where: { id: item.productId },
              data: { soldCount: { increment: item.quantity } },
            });
          }
        });

        await sendEmail({
          to: order.user.email,
          subject: `Payment received for ${order.orderNumber}`,
          html: orderConfirmationTemplate({
            orderNumber: order.orderNumber,
            customerName: order.user.fullName,
            total: `LKR ${Number(order.total).toFixed(2)}`,
            items: order.items.map((item) => ({
              name: item.variantName ? `${item.productName} (${item.variantName})` : item.productName,
              quantity: item.quantity,
              price: `LKR ${Number(item.totalPrice).toFixed(2)}`,
            })),
          }),
        });
      }

      await createAuditLog({
        userId: order.userId,
        action: AuditAction.PAYMENT_RECEIVED,
        entity: 'Order',
        entityId: order.id,
        details: { orderNumber: order.orderNumber, paymentId, statusCode },
      });

      return NextResponse.json({ success: true, message: 'Payment confirmed.' });
    }

    const paymentStatus =
      status === 'pending'
        ? PaymentStatus.PENDING
        : status === 'charged_back'
          ? PaymentStatus.REFUNDED
          : PaymentStatus.FAILED;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        paymentRef: paymentId,
        ...(status === 'charged_back' ? { status: OrderStatus.REFUNDED } : {}),
      },
    });

    await createAuditLog({
      userId: order.userId,
      action: AuditAction.PAYMENT_RECEIVED,
      entity: 'Order',
      entityId: order.id,
      details: { orderNumber: order.orderNumber, paymentId, statusCode, paymentStatus },
    });

    return NextResponse.json({ success: true, message: 'Callback processed.' });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process payment callback.' }, { status: 500 });
  }
}
