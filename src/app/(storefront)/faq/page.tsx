import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers about shipping, customization, payments, delivery times, and returns at Sun Sales.',
  url: '/faq',
});

const sections = [
  {
    id: 'shipping',
    title: 'Shipping & delivery',
    items: [
      ['How long does delivery take?', 'Most Colombo-area orders arrive within 1–3 business days. Other locations in Sri Lanka typically arrive within 2–5 business days depending on the courier route.'],
      ['Do you offer urgent delivery?', 'For selected ready-made gifts, yes. Contact us before checkout and our team will confirm what is currently available for same-day or next-day dispatch.'],
    ],
  },
  {
    id: 'customization',
    title: 'Customization',
    items: [
      ['Can I preview my design before ordering?', 'Yes. Our phone cover customization flow includes a live preview, and custom frame requests are reviewed by our team before final production.'],
      ['What image quality works best?', 'We recommend clear images with good lighting and the highest available resolution to ensure sharp printing results.'],
    ],
  },
  {
    id: 'payments',
    title: 'Payments & returns',
    items: [
      ['Which payment methods are accepted?', 'Sun Sales supports major online payment methods as well as cash on delivery for eligible orders.'],
      ['Can I return personalized items?', 'If a personalized product arrives damaged or incorrect, contact us within 48 hours so we can review and make it right.'],
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />

        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Help center</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">Frequently asked questions</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              Find quick answers about ordering, customization, shipping, payments, and after-sales support.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <AnimatedSection key={section.id} delay={index * 80}>
              <section id={section.id} className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
                <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                <div className="mt-5 space-y-4">
                  {section.items.map(([question, answer]) => (
                    <div key={question} className="rounded-2xl bg-surface-warm p-4">
                      <h3 className="text-body-md font-semibold text-foreground">{question}</h3>
                      <p className="mt-2 text-body-sm leading-6 text-muted">{answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
