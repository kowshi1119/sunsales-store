import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serializeOrder } from '@/lib/orders';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
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

    return NextResponse.json({
      success: true,
      data: serializeOrder(order),
    });
  } catch (error) {
    console.error('Order detail GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load the order.' }, { status: 500 });
  }
}
