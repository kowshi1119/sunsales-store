import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'Review the terms that govern orders, product availability, customization approvals, and use of the Sun Sales website.',
  url: '/terms',
});

const sections = [
  {
    title: 'Orders and availability',
    body: 'All orders are subject to product availability and acceptance. Prices, promotions, and stock visibility may change without prior notice. If an item becomes unavailable after purchase, our team will contact you with replacement or refund options.',
  },
  {
    title: 'Custom product approvals',
    body: 'For personalized orders, customers are responsible for reviewing submitted names, dates, and images before final approval. Production begins only after the confirmed design moves into the approved stage.',
  },
  {
    title: 'Payments and fulfillment',
    body: 'Orders are fulfilled after payment confirmation or when the order is eligible for cash on delivery. Delivery timelines may vary during peak seasons, courier disruptions, or special campaigns.',
  },
  {
    title: 'Website use',
    body: 'You agree to use this website lawfully and not attempt to disrupt services, misuse customer accounts, or copy protected materials in a way that violates applicable rights or policies.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <h1 className="text-display-lg font-display text-foreground">Terms of Service</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              These terms outline how Sun Sales products and online services are offered, fulfilled, and supported.
            </p>
            <div className="mt-6 space-y-5">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  <p className="mt-2 text-body-sm leading-6 text-muted">{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
