import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { BLOG_POSTS } from '@/lib/site-content';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Explore Sun Sales articles on gifting, personalization, styling inspiration, and product care.',
  url: '/blog',
});

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Blog' }]} />

        <AnimatedSection>
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-500">Stories & ideas</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">The Sun Sales blog</h1>
            <p className="mt-3 max-w-3xl text-body-md text-muted">
              Practical gifting advice, customization tips, and inspiration for creating more personal moments.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {BLOG_POSTS.map((post, index) => (
            <AnimatedSection key={post.slug} delay={index * 70}>
              <article className="h-full rounded-3xl border border-surface-border bg-white p-5 shadow-card">
                <p className="text-body-xs font-semibold uppercase tracking-wider text-primary-600">{post.category}</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{post.title}</h2>
                <p className="mt-3 text-body-sm text-muted">{post.excerpt}</p>
                <p className="mt-4 text-body-xs text-muted">{post.publishedAt} • {post.readTime}</p>
                <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-body-sm font-semibold text-primary-600 hover:text-primary-700">
                  Read article <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
