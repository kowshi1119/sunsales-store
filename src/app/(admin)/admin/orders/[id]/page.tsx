import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import OrderDetailView from '@/components/admin/OrderDetailView';
import { generateMetadata as buildMetadata } from '@/lib/seo';

interface AdminOrderDetailPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: AdminOrderDetailPageProps): Metadata {
  return buildMetadata({
    title: `Admin Order ${params.id}`,
    description: 'Review order items, payment, shipping, and fulfillment updates from the Sun Sales admin panel.',
    url: `/admin/orders/${params.id}`,
    noIndex: true,
  });
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  return (
    <AdminShell
      title="Order detail"
      description="Review customer, payment, shipping, and fulfillment information in one place."
    >
      <OrderDetailView orderId={params.id} />
    </AdminShell>
  );
}
