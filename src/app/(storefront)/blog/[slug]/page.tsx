import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/site-content';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return { title: 'Article Not Found | Sun Sales' };
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    url: `/blog/${post.slug}`,
    type: 'article',
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />

        <AnimatedSection>
          <article className="rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
            <p className="text-body-xs font-semibold uppercase tracking-wider text-primary-600">{post.category}</p>
            <h1 className="mt-2 text-display-lg font-display text-foreground">{post.title}</h1>
            <p className="mt-3 text-body-sm text-muted">{post.publishedAt} • {post.readTime}</p>

            <div className="mt-6 space-y-4 text-body-md leading-7 text-muted">
              {post.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </AnimatedSection>
      </div>
    </div>
  );
}
