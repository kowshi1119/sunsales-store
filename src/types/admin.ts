export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  pendingDesigns: number;
  pendingReviews: number;
  lowStockCount: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  hasCustomDesign: boolean;
  createdAt: string;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  basePrice: number;
  salePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  soldCount: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface AdminCustomerListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  isActive: boolean;
}

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT'
  | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED'
  | 'ORDER_SHIPPED' | 'DESIGN_APPROVED' | 'DESIGN_REJECTED'
  | 'SETTINGS_CHANGED';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { fullName: string; email: string } | null;
}
