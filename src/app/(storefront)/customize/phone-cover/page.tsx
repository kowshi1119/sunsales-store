import type { Metadata } from 'next';
import PhoneCoverCustomizer from '@/components/customization/PhoneCoverCustomizer';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Customize Phone Covers',
  description:
    'Design a premium personalized phone cover for your device with live preview, multiple case finishes, and secure checkout from Sun Sales.',
  url: '/customize/phone-cover',
});

export default function PhoneCoverCustomizerPage() {
  return <PhoneCoverCustomizer />;
}
