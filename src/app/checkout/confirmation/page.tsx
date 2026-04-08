import Link from 'next/link';
import { CheckCircle2, PackageCheck, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Order confirmation',
  description: 'Your Sun Sales order was placed successfully.',
  url: '/checkout/confirmation',
  noIndex: true,
});

interface ConfirmationPageProps {
  searchParams: {
    order?: string;
  };
}

export default function CheckoutConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const orderNumber = searchParams.order?.trim() || 'SUN-ORDER';

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-8 md:py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mt-5 text-center">
            <p className="text-body-sm font-semibold uppercase tracking-[0.24em] text-success-600">Order placed</p>
            <h1 className="mt-2 text-display-md font-display text-foreground">Thank you for shopping with Sun Sales</h1>
            <p className="mt-3 text-body-md text-muted">
              Your order has been received successfully. We’ll keep you updated as it moves through confirmation, packing, and delivery.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-surface-border bg-surface-warm/40 px-5 py-4 text-center">
            <p className="text-body-xs font-semibold uppercase tracking-[0.22em] text-muted">Order number</p>
            <p className="mt-2 font-mono text-xl font-bold text-foreground md:text-2xl">{orderNumber}</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-surface-border p-4">
              <div className="flex items-center gap-2 text-foreground">
                <PackageCheck className="h-4 w-4 text-primary-600" />
                <p className="text-body-md font-semibold">What happens next?</p>
              </div>
              <p className="mt-2 text-body-sm text-muted">
                We’ll validate the order, prepare your items, and share updates by email as it moves through fulfillment.
              </p>
            </div>
            <div className="rounded-2xl border border-surface-border p-4">
              <div className="flex items-center gap-2 text-foreground">
                <ShoppingBag className="h-4 w-4 text-primary-600" />
                <p className="text-body-md font-semibold">Need anything else?</p>
              </div>
              <p className="mt-2 text-body-sm text-muted">
                You can continue shopping, revisit your account, or contact support if you need help with delivery details.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/account/orders">
              <Button>View my orders</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Continue shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
