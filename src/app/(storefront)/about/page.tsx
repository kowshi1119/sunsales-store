import type { Metadata } from 'next';
import { HeartHandshake, Palette, ShieldCheck, Truck } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Learn about Sun Sales, our gifting philosophy, and how we create premium custom products for moments that matter.',
  url: '/about',
});

const values = [
  {
    title: 'Thoughtful gifting',
    description: 'We focus on products that feel personal, practical, and memorable for real celebrations and everyday surprises.',
    icon: HeartHandshake,
  },
  {
    title: 'Creative personalization',
    description: 'From phone covers to framed prints, we help customers turn ideas into polished gifts with confidence.',
    icon: Palette,
  },
  {
    title: 'Reliable quality',
    description: 'We choose durable materials, careful finishing, and protective packaging so every order arrives presentation-ready.',
    icon: ShieldCheck,
  },
  {
    title: 'Islandwide service',
    description: 'Fast fulfillment and responsive support help us serve customers across Sri Lanka with less friction and more delight.',
    icon: Truck,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'About Us' }]} />

        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Our story</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">Sun Sales helps people gift with more meaning</h1>
            <p className="mt-4 max-w-3xl text-body-md text-muted">
              We started Sun Sales to make gifting feel easier and more personal. Our collection blends premium ready-to-gift products with customization options that let customers celebrate family, friendships, milestones, and everyday moments in a thoughtful way.
            </p>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              Whether you are ordering a personalized phone cover, a memory-filled photo frame, or a carefully chosen gift set, our goal is the same: help you send something that feels intentional and beautifully finished.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <AnimatedSection key={value.title} delay={index * 60}>
                <div className="h-full rounded-2xl border border-surface-border bg-white p-5 shadow-card">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{value.title}</h2>
                  <p className="mt-2 text-body-sm text-muted">{value.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
}
