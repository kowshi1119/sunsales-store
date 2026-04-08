import { CouponType, OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.DESIGN_REVIEW, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  DESIGN_REVIEW: [OrderStatus.DESIGN_APPROVED, OrderStatus.CANCELLED],
  DESIGN_APPROVED: [OrderStatus.PRODUCTION],
  PRODUCTION: [OrderStatus.SHIPPED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export interface CheckoutLineInput {
  productId: string;
  variantId?: string | null;
  designId?: string | null;
  quantity: number;
}

export interface ResolvedOrderLine {
  productId: string;
  variantId: string | null;
  designId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productName: string;
  productImage: string | null;
  variantName: string | null;
}

export interface ShippingQuote {
  ruleId: string | null;
  name: string;
  cost: number;
  estimatedDays: string;
}

export interface AppliedCouponSummary {
  id: string;
  code: string;
  type: CouponType;
  discount: number;
  freeShipping: boolean;
  description: string;
}

type Decimalish = Prisma.Decimal | number;

interface SerializableOrderLike {
  id: string;
  orderNumber: string;
  subtotal: Decimalish;
  shippingCost: Decimalish;
  discount: Decimalish;
  tax: Decimalish;
  total: Decimalish;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentRef?: string | null;
  couponCode?: string | null;
  notes?: string | null;
  giftMessage?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string | null;
  } | null;
  address?: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    district: string;
    province?: string | null;
    postalCode: string;
    country: string;
  } | null;
  items?: Array<{
    id: string;
    productId: string;
    variantId?: string | null;
    designId?: string | null;
    quantity: number;
    unitPrice: Decimalish;
    totalPrice: Decimalish;
    productName: string;
    productImage?: string | null;
    variantName?: string | null;
    product?: { slug: string } | null;
    design?: {
      previewImage?: string | null;
      status?: string;
      adminNotes?: string | null;
    } | null;
  }>;
  statusHistory?: Array<{
    id: string;
    status: string;
    note?: string | null;
    changedBy?: string | null;
    createdAt: Date;
  }>;
}

export function formatPaymentMethodLabel(method: PaymentMethod | string): string {
  const labels: Record<string, string> = {
    PAYHERE: 'PayHere',
    CASH_ON_DELIVERY: 'Cash on Delivery',
    WEBXPAY: 'WebXPay',
    STRIPE: 'Stripe',
    PAYPAL: 'PayPal',
  };

  return labels[method] || method;
}

export function getValidNextStatuses(currentStatus: OrderStatus, hasCustomDesign: boolean) {
  const transitions = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (currentStatus === OrderStatus.PROCESSING) {
    return transitions.filter((status) => hasCustomDesign || status !== OrderStatus.DESIGN_REVIEW);
  }

  return transitions;
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus, hasCustomDesign: boolean) {
  return getValidNextStatuses(currentStatus, hasCustomDesign).includes(nextStatus);
}

export async function generateUniqueOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderNumber();
    const existing = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${generateOrderNumber()}-${Math.floor(Math.random() * 9)}`;
}

export async function resolveCheckoutItems(userId: string, items: CheckoutLineInput[]) {
  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const variantIds = Array.from(new Set(items.map((item) => item.variantId).filter((value): value is string => Boolean(value))));
  const designIds = Array.from(new Set(items.map((item) => item.designId).filter((value): value is string => Boolean(value))));

  const [products, variants, designs] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        type: true,
        basePrice: true,
        salePrice: true,
        isActive: true,
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
          select: { url: true },
        },
      },
    }),
    variantIds.length > 0
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
            image: true,
          },
        })
      : Promise.resolve([]),
    designIds.length > 0
      ? prisma.savedDesign.findMany({
          where: { id: { in: designIds }, userId },
          select: {
            id: true,
            previewImage: true,
            status: true,
            adminNotes: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const designMap = new Map(designs.map((design) => [design.id, design]));

  let subtotal = 0;
  const lines: ResolvedOrderLine[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product || !product.isActive) {
      throw new Error('One of the items in your cart is no longer available.');
    }

    const variant = item.variantId ? variantMap.get(item.variantId) : null;

    if (item.variantId) {
      if (!variant || !variant.isActive || variant.productId !== product.id) {
        throw new Error(`The selected variant for ${product.name} is unavailable.`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Only ${variant.stock} item(s) remain for ${product.name}.`);
      }
    }

    const design = item.designId ? designMap.get(item.designId) : null;

    if (item.designId && !design) {
      throw new Error('One of your saved custom designs could not be found.');
    }

    const unitPrice = Number(variant?.price ?? product.salePrice ?? product.basePrice);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      designId: design?.id ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      productName: product.name,
      productImage: design?.previewImage ?? variant?.image ?? product.images[0]?.url ?? null,
      variantName: variant?.name ?? null,
    });
  }

  return { lines, subtotal: Math.round(subtotal * 100) / 100 };
}

export async function getShippingQuote(district: string, subtotal: number): Promise<ShippingQuote> {
  const matchedRule = await prisma.shippingRule.findFirst({
    where: {
      isActive: true,
      districts: { has: district },
    },
    orderBy: { baseCost: 'asc' },
  });

  const fallbackRule = matchedRule ?? await prisma.shippingRule.findFirst({
    where: { isActive: true },
    orderBy: { baseCost: 'asc' },
  });

  if (!fallbackRule) {
    return {
      ruleId: null,
      name: 'Standard delivery',
      cost: 0,
      estimatedDays: '2-4 business days',
    };
  }

  const freeShippingMin = fallbackRule.freeShippingMin ? Number(fallbackRule.freeShippingMin) : null;
  const cost = freeShippingMin !== null && subtotal >= freeShippingMin ? 0 : Number(fallbackRule.baseCost);

  return {
    ruleId: fallbackRule.id,
    name: fallbackRule.name,
    cost,
    estimatedDays: fallbackRule.estimatedDays,
  };
}

export async function validateCouponForOrder({ code, subtotal, userId }: {
  code?: string | null;
  subtotal: number;
  userId: string;
}): Promise<AppliedCouponSummary | null> {
  if (!code?.trim()) {
    return null;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    throw new Error('Invalid coupon code.');
  }

  if (!coupon.isActive) {
    throw new Error('This coupon is no longer active.');
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new Error('This coupon has expired.');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This coupon has reached its usage limit.');
  }

  const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minAmount) {
    throw new Error(`Minimum order amount of Rs. ${minAmount.toLocaleString()} required for this coupon.`);
  }

  if (coupon.perUserLimit) {
    const priorUses = await prisma.order.count({
      where: {
        userId,
        couponCode: coupon.code,
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
    });

    if (priorUses >= coupon.perUserLimit) {
      throw new Error('You have already used this coupon the maximum number of times.');
    }
  }

  const value = Number(coupon.value);
  let discount = 0;

  if (coupon.type === CouponType.PERCENTAGE) {
    discount = (subtotal * value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  } else if (coupon.type === CouponType.FIXED_AMOUNT) {
    discount = Math.min(value, subtotal);
  }

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discount: Math.round(discount * 100) / 100,
    freeShipping: coupon.type === CouponType.FREE_SHIPPING,
    description:
      coupon.type === CouponType.PERCENTAGE
        ? `${value}% off`
        : coupon.type === CouponType.FIXED_AMOUNT
          ? `Rs. ${value} off`
          : 'Free shipping',
  };
}

export function serializeOrder(order: SerializableOrderLike) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef ?? null,
    couponCode: order.couponCode ?? null,
    notes: order.notes ?? null,
    giftMessage: order.giftMessage ?? null,
    trackingNumber: order.trackingNumber ?? null,
    trackingUrl: order.trackingUrl ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    user: order.user ?? null,
    address: order.address ?? null,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId ?? null,
      designId: item.designId ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      productName: item.productName,
      productImage: item.productImage ?? null,
      variantName: item.variantName ?? null,
      productSlug: item.product?.slug ?? null,
      design: item.design
        ? {
            previewImage: item.design.previewImage ?? null,
            status: item.design.status ?? null,
            adminNotes: item.design.adminNotes ?? null,
          }
        : null,
    })),
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      id: entry.id,
      status: entry.status,
      note: entry.note ?? null,
      changedBy: entry.changedBy ?? null,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}
