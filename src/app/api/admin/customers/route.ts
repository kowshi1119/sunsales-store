import { AuditAction, OrderStatus, Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin';
import { createAuditLog, getClientIp } from '@/lib/audit';
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
    const status = searchParams.get('status')?.trim() || 'all';

    const where: Prisma.UserWhereInput = {
      role: UserRole.CUSTOMER,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customers: customers.map((customer) => ({
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar,
          isActive: customer.isActive,
          createdAt: customer.createdAt.toISOString(),
          orderCount: customer.orders.length,
          totalSpent: customer.orders
            .filter((order) => order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED)
            .reduce((sum, order) => sum + Number(order.total), 0),
          recentOrders: customer.orders.slice(0, 5).map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            status: order.status,
            createdAt: order.createdAt.toISOString(),
          })),
        })),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Admin customers GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load customers.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const customerId = typeof body.customerId === 'string' ? body.customerId.trim() : '';
    const isActive = Boolean(body.isActive);

    if (!customerId) {
      return NextResponse.json({ success: false, message: 'Customer ID is required.' }, { status: 400 });
    }

    const customer = await prisma.user.findFirst({
      where: { id: customerId, role: UserRole.CUSTOMER },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found.' }, { status: 404 });
    }

    const updatedCustomer = await prisma.user.update({
      where: { id: customer.id },
      data: { isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: updatedCustomer.id,
      ipAddress: getClientIp(request.headers),
      details: {
        previousState: customer.isActive,
        nextState: updatedCustomer.isActive,
        email: updatedCustomer.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer account ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        id: updatedCustomer.id,
        fullName: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        avatar: updatedCustomer.avatar,
        isActive: updatedCustomer.isActive,
        createdAt: updatedCustomer.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin customers PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update the customer account.' }, { status: 500 });
  }
}
