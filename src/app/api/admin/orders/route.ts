import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '10') || 10));
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const paymentStatus = searchParams.get('paymentStatus')?.trim();
    const dateFrom = searchParams.get('dateFrom')?.trim();
    const dateTo = searchParams.get('dateTo')?.trim();

    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'all' && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all' && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: { items: true },
          },
          items: {
            select: { designId: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.fullName,
          customerEmail: order.user.email,
          total: Number(order.total),
          status: order.status,
          paymentStatus: order.paymentStatus,
          itemCount: order._count.items,
          hasCustomDesign: order.items.some((item) => Boolean(item.designId)),
          createdAt: order.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load orders.' }, { status: 500 });
  }
}
