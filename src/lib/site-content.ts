export interface CategoryContent {
  name: string;
  description: string;
  highlights: string[];
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  gifts: {
    name: 'Gift Items',
    description: 'Thoughtful keepsakes, celebration boxes, and meaningful surprises for birthdays, anniversaries, and special milestones.',
    highlights: ['Ready-to-gift picks', 'Fast islandwide delivery', 'Premium wrapping available'],
  },
  'phone-covers': {
    name: 'Phone Covers',
    description: 'Protective and stylish phone covers designed for everyday use, gifting, and one-of-a-kind personalization.',
    highlights: ['Durable materials', 'Live customization preview', 'Models for popular devices'],
  },
  'photo-frames': {
    name: 'Photo Frames',
    description: 'Classic and modern frames crafted to showcase memories beautifully at home, at work, or as heartfelt gifts.',
    highlights: ['Wall and tabletop styles', 'Personalized finishing', 'Gift-ready presentation'],
  },
  'best-sellers': {
    name: 'Best Sellers',
    description: 'Customer favorites chosen for their quality, presentation, and repeat-purchase appeal across every occasion.',
    highlights: ['Top-rated products', 'Most loved gift ideas', 'Seasonal favorites'],
  },
};

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  paragraphs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'gift-ideas-for-every-occasion',
    title: 'Gift Ideas for Every Occasion in Sri Lanka',
    excerpt: 'A practical guide to picking thoughtful, memorable gifts for birthdays, anniversaries, graduations, and festive celebrations.',
    category: 'Gift Guides',
    publishedAt: '2026-03-18',
    readTime: '5 min read',
    paragraphs: [
      'Great gifting starts with understanding the moment. Birthdays call for fun and personality, anniversaries lean into sentiment, and graduation gifts work best when they celebrate progress and a fresh start.',
      'At Sun Sales, our most-loved picks mix usefulness with emotion: premium gift sets, personalized phone covers, and photo frames that highlight a favorite memory.',
      'When you are unsure where to start, focus on three questions: what does the person use every day, what memory do you want to capture, and how quickly do you need delivery. Those answers usually point you toward the right category.',
    ],
  },
  {
    slug: 'how-to-design-a-custom-phone-cover',
    title: 'How to Design a Custom Phone Cover That Feels Personal',
    excerpt: 'From picking the right photo to choosing fonts and colors, here is how to create a phone cover that looks polished and gift-ready.',
    category: 'Customization',
    publishedAt: '2026-02-24',
    readTime: '4 min read',
    paragraphs: [
      'A strong custom phone cover starts with a high-quality image and a simple message. Clean compositions almost always print better than crowded designs.',
      'Use contrast to your advantage: dark text on light backgrounds, light text on rich color blocks, and one or two accent colors that reflect the recipient’s style.',
      'Before placing an order, preview the design on the actual phone model so you can catch alignment issues around the camera cutout and edges.',
    ],
  },
  {
    slug: 'decorating-with-photo-frames',
    title: 'Decorating with Photo Frames: Warm, Story-Driven Spaces',
    excerpt: 'Simple styling tips for building gallery walls, entryway memories, and desk displays with custom photo frames.',
    category: 'Home Styling',
    publishedAt: '2026-01-30',
    readTime: '6 min read',
    paragraphs: [
      'Photo frames work best when they tell a connected story. Choose a consistent color palette or theme, then vary the sizes to keep the arrangement interesting.',
      'For living rooms and hallways, cluster frames at eye level. For desks and side tables, one standout frame paired with a candle or small plant creates a polished, balanced look.',
      'If you are gifting a frame, include a printed photo or note so the person can enjoy it from the moment they open the package.',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
