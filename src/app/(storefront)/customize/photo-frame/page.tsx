import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Frame, Sparkles, Upload } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import Button from '@/components/ui/Button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Custom Photo Frames',
  description: 'Create a premium personalized photo frame with gift-ready finishing and support from the Sun Sales team.',
  url: '/customize/photo-frame',
});

const frameSteps = [
  'Choose your preferred frame style and size.',
  'Share your photo, message, or event details with our team.',
  'Approve the final design before production begins.',
];

export default function PhotoFrameCustomizerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Customize', href: '/customize/phone-cover' }, { label: 'Photo Frames' }]} />

        <AnimatedSection>
          <div className="grid gap-6 rounded-3xl border border-surface-border bg-white p-6 shadow-card md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div>
              <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Personalized keepsakes</p>
              <h1 className="mt-2 text-display-lg font-display text-foreground">Custom photo frames made for meaningful moments</h1>
              <p className="mt-3 max-w-2xl text-body-md text-muted">
                Turn favorite memories into a display-ready gift with premium frame finishes, careful print handling, and support from our production team.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {frameSteps.map((step, index) => (
                  <div key={step} className="rounded-2xl bg-surface-warm p-4">
                    <p className="text-body-xs font-semibold uppercase tracking-wider text-primary-600">Step {index + 1}</p>
                    <p className="mt-2 text-body-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact">
                  <Button leftIcon={<Upload className="h-4 w-4" />}>Request a frame design</Button>
                </Link>
                <Link href="/category/photo-frames">
                  <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>Browse frame ideas</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-primary-50 via-accent-cream/60 to-white p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
                <Frame className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">What you can personalize</h2>
              <ul className="mt-4 space-y-3 text-body-sm text-muted">
                <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary-500" />Names, dates, and short quotes</li>
                <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary-500" />Portraits, family memories, and celebration photos</li>
                <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary-500" />Gift wrapping and message card add-ons</li>
              </ul>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
