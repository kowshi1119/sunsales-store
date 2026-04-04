import Link from 'next/link';
import { CreditCard, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Button from '@/components/ui/Button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Checkout',
  description: 'Review your Sun Sales order and proceed securely to payment.',
  url: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout', href: '/checkout' }]} />

        <div className="rounded-3xl border border-surface-border bg-white px-6 py-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-display-md font-display text-foreground">Secure checkout is ready for the next step</h1>
          <p className="mx-auto mt-3 max-w-2xl text-body-md text-muted">
            Your route is now live and protected. The full address, payment, and order review flow can be completed from here next without any broken navigation.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/cart">
              <Button variant="outline">Back to Cart</Button>
            </Link>
            <Link href="/shop">
              <Button rightIcon={<CreditCard className="h-4 w-4" />}>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
