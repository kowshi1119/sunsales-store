// ============ USER TYPES ============

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
}

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// ============ ORDER TYPES ============

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  notes: string | null;
  giftMessage: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  statusHistory: OrderStatusEntry[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DESIGN_REVIEW'
  | 'DESIGN_APPROVED'
  | 'PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'PAYHERE' | 'WEBXPAY' | 'CASH_ON_DELIVERY' | 'STRIPE' | 'PAYPAL';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  designId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productImage: string | null;
  variantName: string | null;
}

export interface OrderStatusEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}
