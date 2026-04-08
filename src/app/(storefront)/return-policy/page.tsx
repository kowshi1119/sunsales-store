import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Return Policy',
  description: 'Understand Sun Sales return windows, personalized order exceptions, and what to do if an item arrives damaged or incorrect.',
  url: '/return-policy',
});

const policyItems = [
  'Ready-made items can usually be reported for return or exchange within 7 days of delivery when unused and in original packaging.',
  'Personalized or made-to-order items are reviewed case by case if they arrive damaged, defective, or different from the approved design.',
  'To start a return, contact our support team with your order number, photos if applicable, and a short description of the issue.',
  'Approved refunds are returned through the original payment method whenever possible, subject to bank or gateway processing times.',
];

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Return Policy' }]} />
        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <h1 className="text-display-lg font-display text-foreground">Returns & Exchanges</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              We want every order to arrive in excellent condition. If something is wrong, contact us promptly so we can review and help.
            </p>
            <ul className="mt-6 space-y-3 text-body-sm leading-6 text-muted">
              {policyItems.map((item) => (
                <li key={item} className="rounded-2xl bg-surface-warm p-4">{item}</li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
