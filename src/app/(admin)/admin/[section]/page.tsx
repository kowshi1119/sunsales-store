import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomerManagementPanel from '@/components/admin/CustomerManagementPanel';
import AdminShell from '@/components/admin/AdminShell';
import OrderManagementPanel from '@/components/admin/OrderManagementPanel';
import { generateMetadata as buildMetadata } from '@/lib/seo';

const sectionCopy: Record<string, { title: string; description: string; bullets: string[] }> = {
  products: {
    title: 'Products',
    description: 'Manage the live catalog, featured items, pricing updates, and availability rules.',
    bullets: ['Create and edit products', 'Update pricing and inventory', 'Control featured and bestseller visibility'],
  },
  orders: {
    title: 'Orders',
    description: 'Review incoming orders, confirm status transitions, and coordinate production or delivery updates.',
    bullets: ['Track fulfillment progress', 'Review payment and delivery state', 'Respond to customer issues quickly'],
  },
  customers: {
    title: 'Customers',
    description: 'See customer activity, repeat buyers, and account-level support context in one place.',
    bullets: ['Customer profiles', 'Order history summaries', 'Support-ready visibility'],
  },
  categories: {
    title: 'Categories',
    description: 'Organize the storefront navigation and keep collection pages aligned with the catalog strategy.',
    bullets: ['Maintain category hierarchy', 'Update sort order', 'Review SEO naming'],
  },
  coupons: {
    title: 'Coupons',
    description: 'Create targeted promotions, seasonal discounts, and limited-time code campaigns.',
    bullets: ['Create campaign rules', 'Set validity windows', 'Monitor redemption usage'],
  },
  reviews: {
    title: 'Reviews',
    description: 'Moderate reviews, respond to customer feedback, and surface high-trust products.',
    bullets: ['Approve and moderate feedback', 'Reply to customer comments', 'Highlight top-rated items'],
  },
  banners: {
    title: 'Banners',
    description: 'Update homepage promotional spots and campaign creatives without breaking the storefront layout.',
    bullets: ['Schedule campaigns', 'Refresh seasonal creatives', 'Coordinate hero messaging'],
  },
  settings: {
    title: 'Settings',
    description: 'Configure store-wide operational settings, shipping notes, and environment-specific behavior.',
    bullets: ['Update store preferences', 'Review integrations', 'Manage operational defaults'],
  },
  'phone-models': {
    title: 'Phone Models',
    description: 'Maintain supported device models and ensure the customizer offers current case options.',
    bullets: ['Add new device models', 'Manage mockups', 'Control print-area presets'],
  },
  'audit-log': {
    title: 'Audit Log',
    description: 'Track important actions across orders, settings, and admin access for operational accountability.',
    bullets: ['Review admin activity', 'Trace operational changes', 'Support compliance reviews'],
  },
};

interface AdminSectionPageProps {
  params: {
    section: string;
  };
}

export function generateMetadata({ params }: AdminSectionPageProps): Metadata {
  const details = sectionCopy[params.section];

  if (!details) {
    return { title: 'Admin Section Not Found | Sun Sales' };
  }

  return buildMetadata({
    title: `Admin ${details.title}`,
    description: details.description,
    url: `/admin/${params.section}`,
    noIndex: true,
  });
}

export default function AdminSectionPage({ params }: AdminSectionPageProps) {
  const details = sectionCopy[params.section];

  if (!details) {
    notFound();
  }

  const renderSection = () => {
    if (params.section === 'orders') {
      return <OrderManagementPanel />;
    }

    if (params.section === 'customers') {
      return <CustomerManagementPanel />;
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          This admin section now resolves correctly and is ready for the next implementation phase.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {details.bullets.map((bullet) => (
            <li key={bullet} className="rounded-xl bg-slate-50 px-4 py-3">{bullet}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <AdminShell title={details.title} description={details.description}>
      {renderSection()}
    </AdminShell>
  );
}
