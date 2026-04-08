import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Wishlist',
  description: 'Save your favorite Sun Sales items and return when you are ready to purchase or gift them.',
  url: '/wishlist',
  noIndex: true,
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
