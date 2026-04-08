import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search the Sun Sales catalog for gifts, phone covers, photo frames, and more.',
  url: '/search',
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
