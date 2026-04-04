/** Format price in Sri Lankan Rupees (or any currency) */
export function formatPrice(
  amount: number | string,
  currency: string = 'LKR',
  locale: string = 'en-LK'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return 'LKR 0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/** Format price without currency symbol (for inputs) */
export function formatPriceValue(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0.00';
  return numericAmount.toFixed(2);
}

/** Format a date in readable form */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid date';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/** Format date with time */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time (e.g., "2 hours ago") */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateObj, { month: 'short', day: 'numeric' });
}

/** Format Sri Lankan phone number */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return `+94 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `0${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
}

/** Format order status for display */
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    DESIGN_REVIEW: 'Design Review',
    DESIGN_APPROVED: 'Design Approved',
    PRODUCTION: 'In Production',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };

  return statusMap[status] || status;
}

/** Get status color class */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-warning-50 text-warning-700',
    CONFIRMED: 'bg-primary-50 text-primary-700',
    PROCESSING: 'bg-primary-100 text-primary-800',
    DESIGN_REVIEW: 'bg-warning-50 text-warning-700',
    DESIGN_APPROVED: 'bg-success-50 text-success-700',
    PRODUCTION: 'bg-primary-100 text-primary-800',
    SHIPPED: 'bg-blue-50 text-blue-700',
    DELIVERED: 'bg-success-50 text-success-700',
    CANCELLED: 'bg-error-50 text-error-700',
    REFUNDED: 'bg-muted/10 text-muted',
    PAID: 'bg-success-50 text-success-700',
    FAILED: 'bg-error-50 text-error-700',
  };

  return colorMap[status] || 'bg-muted/10 text-muted';
}

/** Format number with K/M suffix */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
