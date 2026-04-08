import { AuditAction, OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { requireAdminSession } from '@/lib/admin';
import {
  orderDeliveredTemplate,
  orderShippedTemplate,
  sendEmail,
} from '@/lib/email';
import { canTransitionOrderStatus, serializeOrder } from '@/lib/orders';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url().optional().or(z.literal('')),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
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
          include: {
            product: {
              select: { slug: true },
            },
            design: {
              select: {
                previewImage: true,
                status: true,
                adminNotes: true,
                uploadedImages: true,
              },
            },
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

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    console.error('Admin order detail GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load order detail.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid status update.' }, { status: 400 });
    }

    const currentOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
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
          select: { designId: true },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const hasCustomDesign = currentOrder.items.some((item) => Boolean(item.designId));

    if (!canTransitionOrderStatus(currentOrder.status, parsed.data.status, hasCustomDesign)) {
      return NextResponse.json({ success: false, message: `Invalid status transition from ${currentOrder.status} to ${parsed.data.status}.` }, { status: 400 });
    }

    const note = parsed.data.note?.trim() || null;
    const trackingNumber = parsed.data.trackingNumber?.trim() || null;
    const trackingUrl = parsed.data.trackingUrl?.trim() || null;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: currentOrder.id },
        data: {
          status: parsed.data.status,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(trackingUrl ? { trackingUrl } : {}),
          ...(parsed.data.status === OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
          ...(parsed.data.status === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
          ...(parsed.data.status === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
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
            include: {
              product: {
                select: { slug: true },
              },
              design: {
                select: {
                  previewImage: true,
                  status: true,
                  adminNotes: true,
                  uploadedImages: true,
                },
              },
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

      await tx.orderStatusHistory.create({
        data: {
          orderId: currentOrder.id,
          status: parsed.data.status,
          note,
          changedBy: session.user.id,
        },
      });

      return order;
    });

    if (parsed.data.status === OrderStatus.SHIPPED) {
      await sendEmail({
        to: updatedOrder.user.email,
        subject: `Your order ${updatedOrder.orderNumber} has shipped`,
        html: orderShippedTemplate(updatedOrder.user.fullName, updatedOrder.orderNumber, trackingNumber, trackingUrl),
      });
    }

    if (parsed.data.status === OrderStatus.DELIVERED) {
      await sendEmail({
        to: updatedOrder.user.email,
        subject: `Your order ${updatedOrder.orderNumber} has been delivered`,
        html: orderDeliveredTemplate(updatedOrder.user.fullName, updatedOrder.orderNumber),
      });
    }

    await createAuditLog({
      userId: session.user.id,
      action: parsed.data.status === OrderStatus.SHIPPED ? AuditAction.ORDER_SHIPPED : AuditAction.STATUS_CHANGE,
      entity: 'Order',
      entityId: updatedOrder.id,
      ipAddress: getClientIp(request.headers),
      details: {
        orderNumber: updatedOrder.orderNumber,
        from: currentOrder.status,
        to: parsed.data.status,
        note,
        trackingNumber,
      },
    });

    const refreshedOrder = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
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
          include: {
            product: {
              select: { slug: true },
            },
            design: {
              select: {
                previewImage: true,
                status: true,
                adminNotes: true,
                uploadedImages: true,
              },
            },
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

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully.',
      data: refreshedOrder ? serializeOrder(refreshedOrder) : null,
    });
  } catch (error) {
    console.error('Admin order PUT error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to update the order.' }, { status: 500 });
  }
}
