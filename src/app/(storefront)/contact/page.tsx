import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import Button from '@/components/ui/Button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Sun Sales for product questions, customization requests, delivery help, or corporate gifting support.',
  url: '/contact',
});

const contactCards = [
  { title: 'Call us', detail: '+94 77 123 4567', href: 'tel:+94771234567', icon: Phone },
  { title: 'Email us', detail: 'hello@sunsales.lk', href: 'mailto:hello@sunsales.lk', icon: Mail },
  { title: 'Visit us', detail: '123 Galle Road, Colombo 03, Sri Lanka', href: 'https://maps.google.com', icon: MapPin },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">We are here to help</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">Contact Sun Sales</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              Reach out for product questions, custom order requests, delivery updates, or corporate gifting support. Our team usually replies within one business day.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <AnimatedSection key={card.title} delay={index * 70}>
                <a href={card.href} className="block h-full rounded-2xl border border-surface-border bg-white p-5 shadow-card transition-transform hover:-translate-y-1">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
                  <p className="mt-2 text-body-sm text-muted">{card.detail}</p>
                </a>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={160}>
          <div className="mt-8 grid gap-6 rounded-3xl border border-surface-border bg-white p-6 shadow-card md:grid-cols-2 md:p-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Business hours</h2>
              <ul className="mt-4 space-y-3 text-body-sm text-muted">
                <li className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary-500" /> Monday to Friday: 9:00 AM – 6:00 PM</li>
                <li className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary-500" /> Saturday: 9:00 AM – 2:00 PM</li>
                <li className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary-500" /> Sunday and public holidays: Online inquiries only</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Quick actions</h2>
              <p className="mt-3 text-body-sm text-muted">Need a fast answer? Use one of the quick options below.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">
                  <Button leftIcon={<MessageCircle className="h-4 w-4" />}>WhatsApp us</Button>
                </a>
                <Link href="/faq">
                  <Button variant="outline">Read the FAQ</Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
