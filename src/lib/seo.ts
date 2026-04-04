import { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from './constants';

interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

/** Generate Next.js metadata for any page */
export function generateMetadata({
  title,
  description = SITE_DESCRIPTION,
  image = '/images/og-default.jpg',
  url = '/',
  type = 'website',
  noIndex = false,
}: SEOConfig = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium Gifts & Custom Products`;
  const fullUrl = `${SITE_URL}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const openGraphType = type === 'product' ? 'website' : type;

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: 'en_US',
      type: openGraphType,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/** Generate JSON-LD structured data for organization */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'LK',
      availableLanguage: ['English', 'Sinhala', 'Tamil'],
    },
    sameAs: [
      'https://facebook.com/sunsales',
      'https://instagram.com/sunsales',
    ],
  };
}

/** Generate JSON-LD for product pages */
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: string;
  slug: string;
  avgRating: number;
  reviewCount: number;
  inStock: boolean;
  sku?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || undefined,
    url: `${SITE_URL}/shop/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: 'LKR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/shop/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

/** Generate breadcrumb JSON-LD */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
