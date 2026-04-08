import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import PasswordForm from '@/components/account/PasswordForm';
import ProfileForm from '@/components/account/ProfileForm';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { authOptions } from '@/lib/auth';
import { formatDate, formatOrderStatus, formatPrice, getStatusColor } from '@/lib/formatters';
import prisma from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

const sectionContent: Record<string, { title: string; description: string }> = {
  orders: {
    title: 'Order History',
    description: 'Review your recent Sun Sales orders, check fulfillment progress, and revisit details for each purchase.',
  },
  addresses: {
    title: 'Saved Addresses',
    description: 'Manage delivery addresses for faster checkout and smoother gifting across Sri Lanka.',
  },
  profile: {
    title: 'Profile Settings',
    description: 'Keep your account details up to date so we can deliver order updates and support messages correctly.',
  },
  password: {
    title: 'Password & Security',
    description: 'Update your credentials and maintain a secure account for future orders and saved designs.',
  },
  wishlist: {
    title: 'Saved Wishlist',
    description: 'Keep track of products you love and revisit gift ideas when it is time to order.',
  },
  designs: {
    title: 'Saved Designs',
    description: 'Review your custom design concepts and continue building personalized orders with confidence.',
  },
};

interface AccountSectionPageProps {
  params: {
    section: string;
  };
}

export function generateMetadata({ params }: AccountSectionPageProps): Metadata {
  const details = sectionContent[params.section];

  if (!details) {
    return { title: 'Account Page Not Found | Sun Sales' };
  }

  return buildMetadata({
    title: details.title,
    description: details.description,
    url: `/account/${params.section}`,
    noIndex: true,
  });
}

export default async function AccountSectionPage({ params }: AccountSectionPageProps) {
  const details = sectionContent[params.section];

  if (!details) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let orders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string; itemCount: number }> = [];
  let addresses: Array<{ id: string; fullName: string; phone: string; addressLine1: string; addressLine2?: string | null; city: string; district: string; province?: string | null; postalCode: string; isDefault: boolean }> = [];
  let designs: Array<{ id: string; type: string; status: string; createdAt: string; updatedAt: string; phoneModelName?: string | null; frameStyleName?: string | null }> = [];
  let profile = {
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  };

  if (userId && process.env.DATABASE_URL) {
    try {
      if (params.section === 'orders') {
        const results = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        });

        orders = results.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          itemCount: order._count.items,
        }));
      }

      if (params.section === 'addresses') {
        const results = await prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        });

        addresses = results;
      }

      if (params.section === 'designs') {
        const results = await prisma.savedDesign.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          include: {
            phoneModel: { select: { name: true } },
            frameStyle: { select: { name: true } },
          },
        });

        designs = results.map((design) => ({
          id: design.id,
          type: design.type,
          status: design.status,
          createdAt: design.createdAt.toISOString(),
          updatedAt: design.updatedAt.toISOString(),
          phoneModelName: design.phoneModel?.name || null,
          frameStyleName: design.frameStyle?.name || null,
        }));
      }

      if (params.section === 'profile') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, email: true, phone: true },
        });

        if (user) {
          profile = user;
        }
      }
    } catch {
      // fall back to empty states
    }
  }

  const renderSection = () => {
    switch (params.section) {
      case 'orders':
        return orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Once you place an order, it will show up here with its live fulfillment status."
            action={<Link href="/shop"><Button>Start shopping</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-2xl border border-surface-border bg-surface-warm/30 p-4 transition-all hover:border-primary-200 hover:shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</p>
                    <p className="mt-1 text-body-sm text-muted">{formatDate(order.createdAt)} • {order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(order.status))}>
                      {formatOrderStatus(order.status)}
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        );
      case 'addresses':
        return addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            description="Save your first address during checkout to speed up future orders."
            action={<Link href="/checkout"><Button>Add address at checkout</Button></Link>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-2xl border border-surface-border bg-surface-warm/30 p-4">
                <div className="flex items-center gap-2">
                  <p className="text-body-md font-semibold text-foreground">{address.fullName}</p>
                  {address.isDefault && <span className="rounded-full bg-secondary-500 px-2.5 py-0.5 text-body-xs font-semibold text-white">Default</span>}
                </div>
                <p className="mt-2 text-body-sm text-muted">{address.phone}</p>
                <p className="mt-2 text-body-sm text-muted">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.district}
                  {address.province ? `, ${address.province}` : ''} {address.postalCode}
                </p>
              </div>
            ))}
          </div>
        );
      case 'profile':
        return <ProfileForm initialFullName={profile.fullName} email={profile.email} initialPhone={profile.phone} />;
      case 'password':
        return <PasswordForm />;
      case 'wishlist':
        return (
          <div className="rounded-2xl bg-surface-warm/60 p-4 text-body-sm text-muted">
            Your wishlist stays synced on the storefront. <Link href="/wishlist" className="font-semibold text-primary-600">Open wishlist</Link> to review saved products.
          </div>
        );
      case 'designs':
        return designs.length === 0 ? (
          <EmptyState
            title="No saved designs yet"
            description="Create a custom phone cover or frame and your saved designs will appear here."
            action={<Link href="/customize/phone-cover"><Button>Start customizing</Button></Link>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {designs.map((design) => (
              <div key={design.id} className="rounded-2xl border border-surface-border bg-surface-warm/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-md font-semibold text-foreground">{design.phoneModelName || design.frameStyleName || 'Custom design'}</p>
                  <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', getStatusColor(design.status))}>
                    {formatOrderStatus(design.status)}
                  </span>
                </div>
                <p className="mt-2 text-body-sm text-muted">{design.type.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-body-xs text-muted">Updated {formatDate(design.updatedAt)}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
      <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Account</p>
      <h1 className="mt-2 text-display-md font-display text-foreground">{details.title}</h1>
      <p className="mt-3 max-w-2xl text-body-md text-muted">{details.description}</p>
      <div className="mt-6">{renderSection()}</div>
    </div>
  );
}
