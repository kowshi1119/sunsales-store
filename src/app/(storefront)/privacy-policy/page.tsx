import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Read how Sun Sales collects, stores, and protects customer data when you browse or place an order.',
  url: '/privacy-policy',
});

const sections = [
  {
    title: 'Information we collect',
    body: 'We collect contact details, delivery information, and order-related content that you provide when you create an account, place an order, or request a custom design. We may also record basic analytics to improve site performance and customer experience.',
  },
  {
    title: 'How we use your information',
    body: 'Your information is used to process orders, deliver products, provide support, send relevant service updates, and improve our catalog and website functionality. We do not sell your personal information to third parties.',
  },
  {
    title: 'Data storage and security',
    body: 'Sun Sales uses commercially reasonable safeguards to protect account and order data. Access is limited to authorized team members and service providers who need the information to operate the store or fulfill your request.',
  },
  {
    title: 'Your choices',
    body: 'You can request updates to your profile information, ask us to remove marketing communications, or contact us with privacy questions at hello@sunsales.lk.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <h1 className="text-display-lg font-display text-foreground">Privacy Policy</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              This policy explains how Sun Sales handles personal information when you browse our website, place an order, or contact our team.
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
