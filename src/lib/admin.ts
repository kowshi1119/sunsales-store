import { DesignStatus, OrderStatus, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import type { AdminOrderListItem, DashboardStats, RevenueDataPoint } from '@/types/admin';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface AdminDashboardData {
  stats: DashboardStats;
  revenue: RevenueDataPoint[];
  recentOrders: AdminOrderListItem[];
}

const DASHBOARD_WINDOWS = [7, 30, 90] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN || role === UserRole.STAFF;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdminRole(session.user.role)) {
    return null;
  }

  return session;
}

function buildRevenueSeries(days: number): RevenueDataPoint[] {
  const points: RevenueDataPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);

    points.push({
      date: date.toISOString().slice(0, 10),
      revenue: 0,
      orders: 0,
    });
  }

  return points;
}

function buildFallbackDashboard(): AdminDashboardData {
  return {
    stats: {
      todayRevenue: 0,
      todayOrders: 0,
      todayCustomers: 0,
      totalProducts: 0,
      pendingOrders: 0,
      pendingDesigns: 0,
      pendingReviews: 0,
      lowStockCount: 0,
    },
    revenue: buildRevenueSeries(90),
    recentOrders: [],
  };
}

export async function getDashboardSnapshot(): Promise<AdminDashboardData> {
  if (!process.env.DATABASE_URL) {
    return buildFallbackDashboard();
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    const [
      ordersToday,
      newCustomersToday,
      totalProducts,
      pendingOrders,
      pendingDesigns,
      pendingReviews,
      lowStockCount,
      recentOrders,
      rollingOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: today },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        select: { total: true },
      }),
      prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: today },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.DESIGN_REVIEW,
              OrderStatus.DESIGN_APPROVED,
              OrderStatus.PRODUCTION,
            ],
          },
        },
      }),
      prisma.savedDesign.count({
        where: {
          status: {
            in: [DesignStatus.SUBMITTED, DesignStatus.UNDER_REVIEW, DesignStatus.REVISION_REQUESTED],
          },
        },
      }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.productVariant.count({ where: { isActive: true, stock: { lte: 5 } } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
          items: {
            select: {
              id: true,
              designId: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: ninetyDaysAgo },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
    ]);

    const revenueByDate = buildRevenueSeries(90);
    const revenueMap = new Map(revenueByDate.map((point) => [point.date, point]));

    for (const order of rollingOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const point = revenueMap.get(key);

      if (point) {
        point.revenue += Number(order.total);
        point.orders += 1;
      }
    }

    const todayRevenue = ordersToday.reduce((sum, order) => sum + Number(order.total), 0);

    return {
      stats: {
        todayRevenue,
        todayOrders: ordersToday.length,
        todayCustomers: newCustomersToday,
        totalProducts,
        pendingOrders,
        pendingDesigns,
        pendingReviews,
        lowStockCount,
      },
      revenue: revenueByDate,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user.fullName,
        customerEmail: order.user.email,
        total: Number(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemCount: order.items.length,
        hasCustomDesign: order.items.some((item) => Boolean(item.designId)),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  } catch {
    return buildFallbackDashboard();
  }
}

export const adminDashboardWindows = DASHBOARD_WINDOWS;
