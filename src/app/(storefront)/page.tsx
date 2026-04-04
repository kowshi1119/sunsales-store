'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Truck,
  Shield,
  RefreshCw,
  Headphones,
  Star,
  ChevronRight,
  Smartphone,
  Frame,
  Gift,
  Heart,
  ShoppingBag,
  Upload,
  Palette,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { SectionHeading, AnimatedSection } from '@/components/shared/SectionHeading';
import { cn } from '@/lib/utils';

// ============ HOMEPAGE ============
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <CategoryGrid />
      <FeaturedProducts />
      <CustomizationShowcase />
      <HowItWorks />
      <BestSellers />
      <Testimonials />
      <WhyChooseUs />
      <NewsletterSection />
    </>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent-cream/30 to-primary-50 noise-overlay">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-accent-coral/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial-glow pointer-events-none" />

      <div className="container-base relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[85vh] py-16 md:py-20">
          {/* Left: Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-primary-500" />
                <span className="text-body-sm font-semibold text-primary-700">New Collection 2024</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-display-lg md:text-display-xl font-display text-foreground mb-5 leading-[1.1]">
                Create Gifts That
                <span className="block text-gradient">Tell Your Story</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-body-lg text-muted mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Premium gifts, custom phone covers with live previews, and personalized photo frames.
                Every product is crafted with love for someone special.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/shop">
                  <Button size="xl" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Explore Collection
                  </Button>
                </Link>
                <Link href="/customize/phone-cover">
                  <Button variant="outline" size="xl" leftIcon={<Palette className="h-5 w-5" />}>
                    Design Your Own
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-200 to-accent-cream border-2 border-white flex items-center justify-center text-body-xs font-bold text-primary-700">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                    ))}
                  </div>
                  <p className="text-body-xs text-muted">
                    <strong className="text-foreground">2,500+</strong> happy customers
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right: Hero Visual */}
          <div className="order-1 lg:order-2 flex justify-center">
            <AnimatedSection delay={200} direction="right">
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Main product showcase card */}
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden aspect-[4/5]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-cream/50 to-primary-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-400 to-accent-coral rounded-2xl flex items-center justify-center shadow-glow">
                        <Gift className="h-12 w-12 text-white" />
                      </div>
                      <p className="font-display text-display-sm text-foreground mb-2">Premium Gifts</p>
                      <p className="text-body-sm text-muted">Handpicked for you</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-lg p-3 animate-bounce-gentle">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                      <Truck className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-body-xs font-semibold text-foreground">Free Delivery</p>
                      <p className="text-[10px] text-muted">Over Rs. 5,000</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-body-xs font-semibold text-foreground">Live Preview</p>
                      <p className="text-[10px] text-muted">See before you buy</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ TRUST BADGES ============
function TrustBadges() {
  const badges = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders Rs. 5,000+' },
    { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
    { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
    { icon: Headphones, label: '24/7 Support', desc: 'WhatsApp & phone' },
  ];

  return (
    <section className="border-y border-surface-border bg-white">
      <div className="container-base py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <badge.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-foreground">{badge.label}</p>
                <p className="text-body-xs text-muted">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CATEGORY GRID ============
function CategoryGrid() {
  const categories = [
    { name: 'Gift Items', slug: 'gifts', icon: Gift, color: 'from-primary-400 to-accent-coral', count: 45 },
    { name: 'Phone Covers', slug: 'phone-covers', icon: Smartphone, color: 'from-secondary-400 to-secondary-600', count: 120 },
    { name: 'Photo Frames', slug: 'photo-frames', icon: Frame, color: 'from-accent-gold to-primary-400', count: 30 },
    { name: 'Best Sellers', slug: 'best-sellers', icon: Star, color: 'from-accent-coral to-primary-500', count: 25 },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-base">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by Category"
          description="Find the perfect gift from our curated collections"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.slug} delay={i * 100}>
              <Link
                href={`/category/${cat.slug}`}
                className="group relative bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1"
              >
                <div className="aspect-square p-6 flex flex-col items-center justify-center text-center">
                  <div className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-slow',
                    cat.color
                  )}>
                    <cat.icon className="h-8 w-8 md:h-10 md:w-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-display-sm text-foreground mb-1">{cat.name}</h3>
                  <p className="text-body-xs text-muted">{cat.count} products</p>
                </div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5 text-primary-400" />
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ FEATURED PRODUCTS ============
function FeaturedProducts() {
  // Demo products — will be replaced with real data from API in Phase 2
  const products = [
    { id: '1', name: 'Crystal Sunset Vase', price: 4500, salePrice: 3800, rating: 4.8, reviews: 42, image: null, badge: 'Sale' },
    { id: '2', name: 'Custom Phone Cover — Floral', price: 2500, salePrice: null, rating: 4.9, reviews: 128, image: null, badge: 'Popular' },
    { id: '3', name: 'Wooden Photo Frame — Classic', price: 3200, salePrice: 2700, rating: 4.7, reviews: 67, image: null, badge: 'Sale' },
    { id: '4', name: 'Aromatherapy Gift Set', price: 5900, salePrice: null, rating: 4.6, reviews: 31, image: null, badge: 'New' },
    { id: '5', name: 'Custom Phone Cover — Galaxy', price: 2500, salePrice: 2000, rating: 4.9, reviews: 95, image: null, badge: 'Sale' },
    { id: '6', name: 'LED Photo Frame — Modern', price: 4800, salePrice: null, rating: 4.5, reviews: 23, image: null, badge: 'New' },
    { id: '7', name: 'Premium Candle Set', price: 3500, salePrice: 2800, rating: 4.7, reviews: 54, image: null, badge: 'Sale' },
    { id: '8', name: 'Custom Phone Cover — Minimal', price: 2500, salePrice: null, rating: 4.8, reviews: 82, image: null, badge: null },
  ];

  const formatLKR = (n: number) => `Rs. ${n.toLocaleString()}`;

  return (
    <section className="section-padding bg-surface-warm">
      <div className="container-base">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="text-body-sm font-semibold uppercase tracking-widest text-primary-500 mb-2 block">Trending</span>
            <h2 className="text-display-md md:text-display-lg font-display text-foreground">Featured Products</h2>
          </div>
          <Link href="/shop" className="hidden md:inline-flex items-center gap-1.5 text-body-md font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 50}>
              <div className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-surface-warm to-surface-hover overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-surface-border" />
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <span className={cn(
                      'absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider',
                      product.badge === 'Sale' && 'bg-error-500 text-white',
                      product.badge === 'New' && 'bg-primary-400 text-white',
                      product.badge === 'Popular' && 'bg-accent-gold text-white',
                    )}>
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist */}
                  <button
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4 text-muted" />
                  </button>

                  {/* Quick add */}
                  <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-normal">
                    <button className="w-full h-9 bg-foreground text-white text-body-xs font-semibold rounded-lg hover:bg-secondary-500 transition-colors flex items-center justify-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn('h-3 w-3', j < Math.floor(product.rating) ? 'fill-primary-400 text-primary-400' : 'fill-surface-border text-surface-border')} />
                    ))}
                    <span className="text-[11px] text-muted ml-0.5">({product.reviews})</span>
                  </div>
                  <h3 className="text-body-sm font-medium text-foreground line-clamp-2 mb-2 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-price-sm font-bold text-foreground">
                      {formatLKR(product.salePrice ?? product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-body-xs text-muted line-through">{formatLKR(product.price)}</span>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============ CUSTOMIZATION SHOWCASE ============
function CustomizationShowcase() {
  return (
    <section className="section-padding bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial-glow opacity-30 pointer-events-none" />
      <div className="absolute top-20 -right-40 w-80 h-80 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-base relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary-300" />
              <span className="text-body-xs font-semibold text-primary-200 uppercase tracking-wider">Our Signature Feature</span>
            </span>
            <h2 className="text-display-md md:text-display-lg font-display text-white mb-5">
              Design Your Own
              <span className="block text-primary-300">Custom Products</span>
            </h2>
            <p className="text-body-lg text-white/70 mb-8 max-w-md leading-relaxed">
              Upload your photos, add text, choose your style — and see a live preview
              of your custom phone cover or photo frame before you buy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/customize/phone-cover">
                <Button size="lg" rightIcon={<Smartphone className="h-5 w-5" />}>
                  Custom Phone Cover
                </Button>
              </Link>
              <Link href="/customize/photo-frame">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" rightIcon={<Frame className="h-5 w-5" />}>
                  Custom Photo Frame
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Upload, label: 'Upload Photo' },
                { icon: Palette, label: 'Customize' },
                { icon: Eye, label: 'Live Preview' },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-4 w-4 text-primary-300" />
                  </div>
                  <span className="text-body-xs font-medium text-white/80">{step.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Right: Visual */}
          <AnimatedSection delay={200} direction="right">
            <div className="relative flex justify-center">
              <div className="w-full max-w-sm">
                {/* Mock phone case preview */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 p-8 aspect-[3/4] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-accent-coral rounded-2xl flex items-center justify-center">
                      <Smartphone className="h-10 w-10 text-white" />
                    </div>
                    <p className="font-display text-lg text-white mb-1">Live Preview</p>
                    <p className="text-body-sm text-white/50">See your design in real-time</p>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-2.5 animate-bounce-gentle">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
                      <span className="text-body-xs font-bold text-foreground">4.9</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-3 -left-3 bg-primary-400 text-white rounded-xl shadow-lg px-4 py-2.5">
                    <p className="text-body-xs font-bold">From Rs. 2,500</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ============ HOW IT WORKS ============
function HowItWorks() {
  const steps = [
    { step: '01', title: 'Choose Your Product', desc: 'Select a phone model or frame style from our collection.', icon: ShoppingBag },
    { step: '02', title: 'Upload & Design', desc: 'Upload your photo, add text, and customize the design to perfection.', icon: Upload },
    { step: '03', title: 'Preview & Order', desc: 'See a realistic live preview, then add to cart and checkout.', icon: Eye },
    { step: '04', title: 'Receive & Enjoy', desc: 'We produce and ship your custom creation with care.', icon: Gift },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-base">
        <SectionHeading
          eyebrow="How It Works"
          title="Creating Your Custom Product"
          description="Four simple steps to a uniquely personal gift"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <AnimatedSection key={s.step} delay={i * 100}>
              <div className="relative text-center">
                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-surface-border" />
                )}
                <div className="relative z-10 w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-cream flex items-center justify-center border border-primary-100">
                  <s.icon className="h-8 w-8 text-primary-600" strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary-400 text-white text-body-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-display-sm text-foreground mb-2">{s.title}</h3>
                <p className="text-body-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ BEST SELLERS ============
function BestSellers() {
  const items = [
    { name: 'Galaxy Phone Cover', price: 'Rs. 2,500', rating: 4.9, sold: '1.2K sold' },
    { name: 'Rustic Wood Frame', price: 'Rs. 3,200', rating: 4.8, sold: '890 sold' },
    { name: 'Luxury Gift Box', price: 'Rs. 5,500', rating: 4.7, sold: '650 sold' },
  ];

  return (
    <section className="section-padding bg-surface-warm">
      <div className="container-base">
        <SectionHeading eyebrow="Most Loved" title="Best Sellers" />
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 100}>
              <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-normal group cursor-pointer">
                <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-surface-warm to-surface-hover mb-5 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                  <Star className="h-10 w-10 text-surface-border" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-display-sm text-foreground">{item.name}</h3>
                  <span className="text-body-xs text-muted">{item.sold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-price-md font-bold text-foreground">{item.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                    <span className="text-body-sm font-semibold">{item.rating}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ TESTIMONIALS ============
function Testimonials() {
  const reviews = [
    { name: 'Amara P.', location: 'Colombo', text: 'The phone cover quality is amazing! The live preview was exactly what I received. Will definitely order again.', rating: 5 },
    { name: 'Dinesh K.', location: 'Kandy', text: 'Ordered a custom photo frame for my parents\' anniversary. They loved it! Beautiful packaging too.', rating: 5 },
    { name: 'Shenali F.', location: 'Galle', text: 'Fast delivery and premium quality. The gift box I ordered was even better than expected. Thank you Sun Sales!', rating: 5 },
    { name: 'Ravindu S.', location: 'Negombo', text: 'The customization tool is so easy to use. Designed my phone cover in minutes and it looks incredible.', rating: 4 },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-base">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Customers Say"
          description="Join thousands of happy Sun Sales customers"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review, i) => (
            <AnimatedSection key={review.name} delay={i * 100}>
              <div className="bg-white rounded-xl p-5 shadow-card h-full flex flex-col">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={cn('h-3.5 w-3.5', j < review.rating ? 'fill-primary-400 text-primary-400' : 'fill-surface-border text-surface-border')} />
                  ))}
                </div>
                <p className="text-body-sm text-muted flex-1 mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-accent-cream flex items-center justify-center text-body-xs font-bold text-primary-700">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-body-xs text-muted">{review.location}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ WHY CHOOSE US ============
function WhyChooseUs() {
  const features = [
    { icon: Sparkles, title: 'Premium Quality', desc: 'Every product is crafted with premium materials and attention to detail.' },
    { icon: Eye, title: 'Live Preview', desc: 'See exactly what you\'ll get with our real-time customization engine.' },
    { icon: Truck, title: 'Island-wide Delivery', desc: 'We deliver across Sri Lanka with express shipping available.' },
    { icon: Shield, title: 'Satisfaction Guarantee', desc: 'Not happy? We offer hassle-free returns within 7 days.' },
  ];

  return (
    <section className="section-padding bg-surface-warm">
      <div className="container-base">
        <SectionHeading eyebrow="Why Sun Sales" title="The Sun Sales Difference" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <AnimatedSection key={feat.title} delay={i * 100}>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-400 to-accent-coral flex items-center justify-center shadow-glow">
                  <feat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-display-sm text-foreground mb-2">{feat.title}</h3>
                <p className="text-body-sm text-muted leading-relaxed">{feat.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ NEWSLETTER ============
function NewsletterSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 via-accent-cream/30 to-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container-base relative z-10 text-center">
        <AnimatedSection>
          <h2 className="text-display-md md:text-display-lg font-display text-foreground mb-3">
            Don&apos;t Miss Out
          </h2>
          <p className="text-body-lg text-muted mb-8 max-w-md mx-auto">
            Subscribe for exclusive deals, new arrivals, and gift inspiration delivered to your inbox.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-5 bg-white border border-surface-border rounded-lg text-body-md placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all"
              required
            />
            <Button size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-body-xs text-muted mt-3">No spam, ever. Unsubscribe anytime.</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
