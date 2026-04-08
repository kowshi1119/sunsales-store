import { Suspense } from 'react';
import CheckoutExperience from '@/components/checkout/CheckoutExperience';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Checkout',
  description: 'Review your Sun Sales order, choose delivery details, and complete payment securely.',
  url: '/checkout',
  noIndex: true,
});

function CheckoutFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-2xl bg-surface-warm" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface-warm" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-surface-warm" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutExperience />
    </Suspense>
  );
}
