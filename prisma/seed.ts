import { PrismaClient, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============ ADMIN USER ============
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sunsales.lk' },
    update: {
      password: adminPassword,
      fullName: 'Sun Sales Admin',
      phone: '+94771234567',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
    create: {
      email: 'admin@sunsales.lk',
      password: adminPassword,
      fullName: 'Sun Sales Admin',
      phone: '+94771234567',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user created');

  // ============ DEMO CUSTOMER ============
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      fullName: 'Amara Perera',
      phone: '+94777654321',
      role: 'CUSTOMER',
      emailVerified: true,
    },
  });

  // Customer address
  await prisma.address.upsert({
    where: { id: 'addr-demo-1' },
    update: {},
    create: {
      id: 'addr-demo-1',
      userId: customer.id,
      fullName: 'Amara Perera',
      phone: '+94777654321',
      addressLine1: '42 Flower Road',
      addressLine2: 'Apt 3B',
      city: 'Colombo 07',
      district: 'Colombo',
      province: 'Western',
      postalCode: '00700',
      isDefault: true,
    },
  });
  console.log('✅ Demo customer created');

  // ============ CATEGORIES ============
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'gifts' },
      update: {},
      create: { name: 'Gift Items', slug: 'gifts', description: 'Premium handpicked gift items for every occasion', image: '/images/categories/gifts.jpg', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'phone-covers' },
      update: {},
      create: { name: 'Phone Covers', slug: 'phone-covers', description: 'Custom and premium phone covers', image: '/images/categories/phone-covers.jpg', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'photo-frames' },
      update: {},
      create: { name: 'Photo Frames', slug: 'photo-frames', description: 'Personalized photo frames for your memories', image: '/images/categories/photo-frames.jpg', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'candles-aromatherapy' },
      update: {},
      create: { name: 'Candles & Aromatherapy', slug: 'candles-aromatherapy', description: 'Premium scented candles and wellness products', image: '/images/categories/candles.jpg', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'home-decor' },
      update: {},
      create: { name: 'Home Décor', slug: 'home-decor', description: 'Elegant home décor accents and accessories', image: '/images/categories/home-decor.jpg', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Stylish accessories and personal items', image: '/images/categories/accessories.jpg', sortOrder: 6 },
    }),
  ]);
  console.log('✅ Categories created');

  // ============ PRODUCTS ============
  const productData: {
    name: string; slug: string; desc: string; short: string; type: ProductType;
    price: number; sale: number | null; sku: string; tags: string[];
    featured: boolean; bestSeller: boolean; newArrival: boolean;
    categoryIndex: number; rating: number; reviews: number; sold: number;
  }[] = [
    { name: 'Crystal Sunset Vase', slug: 'crystal-sunset-vase', desc: 'A stunning handblown crystal vase with amber and coral swirls, inspired by Sri Lankan sunsets. Perfect as a centerpiece or a premium gift. Each piece is unique due to the artisan process.', short: 'Handblown crystal vase with sunset colors', type: 'STANDARD', price: 4500, sale: 3800, sku: 'SUN-GFT-001', tags: ['vase', 'crystal', 'home', 'premium'], featured: true, bestSeller: true, newArrival: false, categoryIndex: 0, rating: 4.8, reviews: 42, sold: 189 },
    { name: 'Aromatherapy Gift Set — Lavender', slug: 'aromatherapy-gift-set-lavender', desc: 'A luxurious gift set featuring lavender essential oil, soy wax candle, dried flower sachet, and a ceramic diffuser. Beautifully packaged in our signature Sun Sales box.', short: 'Premium lavender aromatherapy bundle', type: 'STANDARD', price: 5900, sale: null, sku: 'SUN-GFT-002', tags: ['aromatherapy', 'lavender', 'gift-set', 'wellness'], featured: true, bestSeller: false, newArrival: true, categoryIndex: 3, rating: 4.6, reviews: 31, sold: 97 },
    { name: 'Custom Phone Cover — Floral Garden', slug: 'custom-phone-cover-floral', desc: 'Design your own phone cover with our live customization engine. This floral garden base design can be personalized with your photos, text, and custom elements. Available for all major phone models.', short: 'Customizable floral phone cover', type: 'CUSTOMIZABLE_PHONE_COVER', price: 2500, sale: null, sku: 'SUN-PHN-001', tags: ['phone-cover', 'floral', 'custom', 'personalized'], featured: true, bestSeller: true, newArrival: false, categoryIndex: 1, rating: 4.9, reviews: 128, sold: 523 },
    { name: 'Wooden Photo Frame — Classic Oak', slug: 'wooden-photo-frame-classic-oak', desc: 'A timeless classic oak photo frame crafted from sustainable Sri Lankan wood. Features a rich grain finish and stands perfectly on any surface. Customizable with your photo and engraved text.', short: 'Classic oak frame with engraving option', type: 'CUSTOMIZABLE_FRAME', price: 3200, sale: 2700, sku: 'SUN-FRM-001', tags: ['photo-frame', 'wood', 'classic', 'engraved'], featured: true, bestSeller: true, newArrival: false, categoryIndex: 2, rating: 4.7, reviews: 67, sold: 312 },
    { name: 'Custom Phone Cover — Galaxy Nebula', slug: 'custom-phone-cover-galaxy', desc: 'A stunning deep space design with nebula colors. Upload your photo to place it within the cosmic swirls for a truly unique phone cover. Premium hard-shell construction.', short: 'Galaxy-themed customizable phone cover', type: 'CUSTOMIZABLE_PHONE_COVER', price: 2500, sale: 2000, sku: 'SUN-PHN-002', tags: ['phone-cover', 'galaxy', 'space', 'custom'], featured: false, bestSeller: true, newArrival: false, categoryIndex: 1, rating: 4.9, reviews: 95, sold: 445 },
    { name: 'LED Photo Frame — Modern Acrylic', slug: 'led-photo-frame-modern', desc: 'Contemporary acrylic photo frame with built-in warm LED backlighting. Creates a beautiful glowing effect around your photo. USB-C powered, includes remote control for light settings.', short: 'Backlit modern acrylic photo frame', type: 'CUSTOMIZABLE_FRAME', price: 4800, sale: null, sku: 'SUN-FRM-002', tags: ['photo-frame', 'led', 'modern', 'acrylic'], featured: true, bestSeller: false, newArrival: true, categoryIndex: 2, rating: 4.5, reviews: 23, sold: 78 },
    { name: 'Premium Candle Set — Jasmine & Sandalwood', slug: 'premium-candle-set-jasmine', desc: 'Set of three hand-poured soy wax candles in jasmine, sandalwood, and vanilla scents. Encased in elegant ceramic containers with wooden lids. 40-hour burn time per candle.', short: 'Three soy candle set in ceramic pots', type: 'STANDARD', price: 3500, sale: 2800, sku: 'SUN-CND-001', tags: ['candle', 'jasmine', 'sandalwood', 'soy'], featured: false, bestSeller: true, newArrival: false, categoryIndex: 3, rating: 4.7, reviews: 54, sold: 231 },
    { name: 'Custom Phone Cover — Minimal Line Art', slug: 'custom-phone-cover-minimal', desc: 'Clean minimal line art design perfect for those who love understated elegance. Add your name or initials in a sophisticated font for a personalized touch.', short: 'Minimalist line art phone cover', type: 'CUSTOMIZABLE_PHONE_COVER', price: 2500, sale: null, sku: 'SUN-PHN-003', tags: ['phone-cover', 'minimal', 'line-art', 'elegant'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 1, rating: 4.8, reviews: 82, sold: 367 },
    { name: 'Handwoven Basket Gift Set', slug: 'handwoven-basket-gift-set', desc: 'A beautifully curated gift basket featuring artisan chocolates, dried fruit, premium tea, and a handwoven Sri Lankan cane basket. Perfect for housewarming or corporate gifts.', short: 'Curated gift basket with artisan goods', type: 'STANDARD', price: 7500, sale: 6500, sku: 'SUN-GFT-003', tags: ['gift-basket', 'artisan', 'corporate', 'premium'], featured: true, bestSeller: false, newArrival: true, categoryIndex: 0, rating: 4.9, reviews: 18, sold: 45 },
    { name: 'Floating Shelf Photo Frame Set', slug: 'floating-shelf-frame-set', desc: 'Set of 3 floating shelf photo frames in different sizes. Matte black metal with warm wood accents. Includes easy-mount hardware. Create a stunning gallery wall.', short: 'Set of 3 floating photo shelf frames', type: 'STANDARD', price: 5200, sale: 4500, sku: 'SUN-FRM-003', tags: ['photo-frame', 'floating', 'gallery-wall', 'set'], featured: false, bestSeller: false, newArrival: true, categoryIndex: 2, rating: 4.6, reviews: 35, sold: 112 },
    { name: 'Custom Phone Cover — Tropical Paradise', slug: 'custom-phone-cover-tropical', desc: 'Vibrant tropical design with palm leaves, exotic flowers, and sunset hues. Customize with your photo for a vacation-inspired phone cover.', short: 'Tropical themed customizable phone cover', type: 'CUSTOMIZABLE_PHONE_COVER', price: 2500, sale: 2200, sku: 'SUN-PHN-004', tags: ['phone-cover', 'tropical', 'summer', 'colorful'], featured: false, bestSeller: false, newArrival: true, categoryIndex: 1, rating: 4.7, reviews: 41, sold: 178 },
    { name: 'Ceramic Planter — Handpainted', slug: 'ceramic-planter-handpainted', desc: 'Artisan handpainted ceramic planter with traditional Sri Lankan patterns. Perfect for small indoor plants or as a decorative accent. Each piece is one-of-a-kind.', short: 'Handpainted ceramic planter', type: 'STANDARD', price: 2800, sale: null, sku: 'SUN-DEC-001', tags: ['planter', 'ceramic', 'handpainted', 'decor'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 4, rating: 4.5, reviews: 29, sold: 156 },
    { name: 'Luxury Pen & Journal Set', slug: 'luxury-pen-journal-set', desc: 'Premium leather-bound journal with gold-edged pages paired with a refillable brass ballpoint pen. Elegantly boxed. Ideal for professionals or special occasions.', short: 'Leather journal with brass pen in gift box', type: 'STANDARD', price: 4200, sale: 3600, sku: 'SUN-ACC-001', tags: ['journal', 'pen', 'leather', 'luxury'], featured: true, bestSeller: false, newArrival: false, categoryIndex: 5, rating: 4.8, reviews: 22, sold: 89 },
    { name: 'Rose Gold Photo Frame — Vintage', slug: 'rose-gold-frame-vintage', desc: 'Elegant rose gold metallic frame with vintage filigree detailing. Fits 5x7 inch photos. A perfect addition to a romantic bedroom or as a gift for anniversaries.', short: 'Vintage style rose gold photo frame', type: 'CUSTOMIZABLE_FRAME', price: 3800, sale: null, sku: 'SUN-FRM-004', tags: ['photo-frame', 'rose-gold', 'vintage', 'romantic'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 2, rating: 4.6, reviews: 38, sold: 145 },
    { name: 'Scented Wax Melt Collection', slug: 'scented-wax-melt-collection', desc: 'Collection of 12 scented wax melts in assorted fragrances: ocean breeze, cinnamon spice, fresh linen, and tropical fruit. Use with any standard wax warmer.', short: '12-piece scented wax melt assortment', type: 'STANDARD', price: 1800, sale: 1500, sku: 'SUN-CND-002', tags: ['wax-melt', 'scented', 'collection', 'home'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 3, rating: 4.4, reviews: 62, sold: 287 },
    { name: 'Custom Phone Cover — Watercolor Art', slug: 'custom-phone-cover-watercolor', desc: 'Beautiful watercolor splash design in soft pastel tones. Upload your photo to blend seamlessly with the artistic background. Premium soft-touch finish.', short: 'Watercolor style customizable phone cover', type: 'CUSTOMIZABLE_PHONE_COVER', price: 2800, sale: 2400, sku: 'SUN-PHN-005', tags: ['phone-cover', 'watercolor', 'pastel', 'art'], featured: false, bestSeller: false, newArrival: true, categoryIndex: 1, rating: 4.8, reviews: 33, sold: 142 },
    { name: 'Macramé Wall Hanging — Large', slug: 'macrame-wall-hanging-large', desc: 'Hand-knotted macramé wall hanging in natural cotton. Measures 60cm wide x 90cm long. A beautiful bohemian accent for any living space.', short: 'Large handmade macramé wall décor', type: 'STANDARD', price: 4500, sale: null, sku: 'SUN-DEC-002', tags: ['macrame', 'wall-hanging', 'boho', 'handmade'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 4, rating: 4.7, reviews: 19, sold: 68 },
    { name: 'Personalized Name Necklace — Gold', slug: 'personalized-name-necklace-gold', desc: 'Delicate gold-plated stainless steel necklace with custom name pendant. Adjustable 16-20 inch chain. Comes in a velvet jewelry box. Perfect birthday or anniversary gift.', short: 'Custom name gold-plated necklace', type: 'STANDARD', price: 3200, sale: 2800, sku: 'SUN-ACC-002', tags: ['necklace', 'personalized', 'gold', 'jewelry'], featured: true, bestSeller: true, newArrival: false, categoryIndex: 5, rating: 4.9, reviews: 76, sold: 412 },
    { name: 'Bamboo Desk Organizer', slug: 'bamboo-desk-organizer', desc: 'Sustainable bamboo desk organizer with phone holder, pen slots, and storage compartments. Compact design fits any workspace. A thoughtful gift for professionals.', short: 'Sustainable bamboo workspace organizer', type: 'STANDARD', price: 2200, sale: null, sku: 'SUN-ACC-003', tags: ['desk', 'organizer', 'bamboo', 'sustainable'], featured: false, bestSeller: false, newArrival: true, categoryIndex: 5, rating: 4.5, reviews: 27, sold: 134 },
    { name: 'Glass Terrarium — Geometric', slug: 'glass-terrarium-geometric', desc: 'Modern geometric glass terrarium for succulents and air plants. Black metal frame with clear glass panels. Does not include plants. A stunning desk or shelf accent.', short: 'Geometric glass terrarium for plants', type: 'STANDARD', price: 3000, sale: 2500, sku: 'SUN-DEC-003', tags: ['terrarium', 'glass', 'geometric', 'modern'], featured: false, bestSeller: false, newArrival: false, categoryIndex: 4, rating: 4.6, reviews: 44, sold: 198 },
  ];

  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        shortDescription: p.short,
        type: p.type,
        basePrice: p.price,
        salePrice: p.sale,
        sku: p.sku,
        isFeatured: p.featured,
        isBestSeller: p.bestSeller,
        isNewArrival: p.newArrival,
        tags: p.tags,
        avgRating: p.rating,
        reviewCount: p.reviews,
        soldCount: p.sold,
        images: {
          create: [
            { url: `/images/placeholders/product-${p.slug}.jpg`, alt: p.name, sortOrder: 0 },
          ],
        },
        categories: {
          create: [{ categoryId: categories[p.categoryIndex].id }],
        },
      },
    });

    // Add variants for phone covers
    if (p.type === 'CUSTOMIZABLE_PHONE_COVER') {
      const existing = await prisma.productVariant.findFirst({ where: { productId: product.id } });
      if (!existing) {
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Hard Case', sku: `${p.sku}-HARD`, price: p.price, stock: 100, attributes: { material: 'Hard Plastic' } },
            { productId: product.id, name: 'Soft Silicone', sku: `${p.sku}-SOFT`, price: p.price + 300, stock: 80, attributes: { material: 'Soft Silicone' } },
            { productId: product.id, name: 'Tough Case', sku: `${p.sku}-TOUGH`, price: p.price + 800, stock: 50, attributes: { material: 'Tough Dual-Layer' } },
          ],
        });
      }
    }

    // Add variants for frames
    if (p.type === 'CUSTOMIZABLE_FRAME') {
      const existing = await prisma.productVariant.findFirst({ where: { productId: product.id } });
      if (!existing) {
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: '4×6 inch', sku: `${p.sku}-4X6`, price: p.price, stock: 50, attributes: { size: '4×6' } },
            { productId: product.id, name: '5×7 inch', sku: `${p.sku}-5X7`, price: p.price + 500, stock: 40, attributes: { size: '5×7' } },
            { productId: product.id, name: '8×10 inch', sku: `${p.sku}-8X10`, price: p.price + 1200, stock: 30, attributes: { size: '8×10' } },
          ],
        });
      }
    }
  }
  console.log(`✅ ${productData.length} products created`);

  // ============ PHONE BRANDS & MODELS ============
  const brands = [
    { name: 'Apple', slug: 'apple', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13'] },
    { name: 'Samsung', slug: 'samsung', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy A54', 'Galaxy A34'] },
    { name: 'OnePlus', slug: 'oneplus', models: ['OnePlus 12', 'OnePlus 12R', 'OnePlus Nord CE 4', 'OnePlus Nord 3'] },
    { name: 'Xiaomi', slug: 'xiaomi', models: ['Xiaomi 14', 'Redmi Note 13 Pro', 'Redmi Note 13', 'POCO F6 Pro'] },
    { name: 'Huawei', slug: 'huawei', models: ['P60 Pro', 'Nova 12', 'Mate 60 Pro'] },
  ];

  for (const brand of brands) {
    const b = await prisma.phoneBrand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { name: brand.name, slug: brand.slug, logo: `/images/brands/${brand.slug}.png` },
    });

    for (const modelName of brand.models) {
      const modelSlug = modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await prisma.phoneModel.upsert({
        where: { slug: modelSlug },
        update: {},
        create: {
          brandId: b.id,
          name: modelName,
          slug: modelSlug,
          mockupImage: `/images/mockups/phone-${modelSlug}.png`,
          printArea: { x: 50, y: 80, width: 300, height: 550 },
          caseTypes: ['hard', 'soft', 'tough'],
        },
      });
    }
  }
  console.log('✅ Phone brands & models created');

  // ============ FRAME STYLES ============
  const frameStyles = [
    { name: 'Classic Wood', slug: 'classic-wood', sizes: ['4×6', '5×7', '8×10'], materials: ['Oak', 'Walnut', 'Pine'], colors: ['Natural', 'Dark Stain', 'White Wash'] },
    { name: 'Modern Metal', slug: 'modern-metal', sizes: ['4×6', '5×7', '8×10', '11×14'], materials: ['Aluminum', 'Steel'], colors: ['Black', 'Silver', 'Rose Gold'] },
    { name: 'Rustic Barnwood', slug: 'rustic-barnwood', sizes: ['5×7', '8×10'], materials: ['Reclaimed Wood'], colors: ['Weathered Grey', 'Rustic Brown'] },
  ];

  for (const frame of frameStyles) {
    await prisma.frameStyle.upsert({
      where: { slug: frame.slug },
      update: {},
      create: {
        name: frame.name,
        slug: frame.slug,
        mockupImage: `/images/mockups/frame-${frame.slug}.png`,
        photoArea: { x: 40, y: 40, width: 320, height: 420 },
        sizes: frame.sizes,
        materials: frame.materials,
        colors: frame.colors,
      },
    });
  }
  console.log('✅ Frame styles created');

  // ============ SHIPPING RULES ============
  await prisma.shippingRule.upsert({
    where: { id: 'ship-local' },
    update: {},
    create: {
      id: 'ship-local',
      zone: 'LOCAL',
      name: 'Colombo District',
      districts: ['Colombo'],
      baseCost: 300,
      freeShippingMin: 5000,
      estimatedDays: '1-2 days',
    },
  });
  await prisma.shippingRule.upsert({
    where: { id: 'ship-domestic' },
    update: {},
    create: {
      id: 'ship-domestic',
      zone: 'DOMESTIC',
      name: 'Rest of Sri Lanka',
      districts: ['Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle', 'Trincomalee', 'Batticaloa', 'Ampara', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
      baseCost: 500,
      perKgCost: 50,
      freeShippingMin: 8000,
      estimatedDays: '2-4 days',
    },
  });
  console.log('✅ Shipping rules created');

  // ============ COUPONS ============
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 2000,
      maxDiscount: 1000,
      usageLimit: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'FREESHIP' },
    update: {},
    create: {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0,
      minOrderAmount: 3000,
      usageLimit: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Coupons created');

  // ============ FAQs ============
  const faqs = [
    { q: 'How long does delivery take?', a: 'Delivery within Colombo takes 1-2 business days. Rest of Sri Lanka is 2-4 business days. Custom products may take an additional 1-2 days for production.', cat: 'shipping' },
    { q: 'Can I customize my phone cover?', a: 'Yes! Our live customization engine lets you upload photos, add text, and see a real-time preview of your phone cover before ordering.', cat: 'customization' },
    { q: 'What is your return policy?', a: 'We offer a 7-day return policy for standard products. Custom products can be returned if they have manufacturing defects.', cat: 'returns' },
    { q: 'How do I track my order?', a: 'Once shipped, you\'ll receive an email with your tracking number. You can also track from your account dashboard.', cat: 'orders' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard via PayHere, and Cash on Delivery (COD) for orders within Sri Lanka.', cat: 'general' },
    { q: 'Are your products gift-wrapped?', a: 'Yes! All products come in our signature Sun Sales packaging. You can also add a gift message during checkout.', cat: 'general' },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await prisma.fAQ.upsert({
      where: { id: `faq-${i + 1}` },
      update: {},
      create: { id: `faq-${i + 1}`, question: faqs[i].q, answer: faqs[i].a, category: faqs[i].cat, sortOrder: i },
    });
  }
  console.log('✅ FAQs created');

  // ============ SITE SETTINGS ============
  const settings = [
    { key: 'store_name', value: { name: 'Sun Sales' } },
    { key: 'store_email', value: { email: 'hello@sunsales.lk' } },
    { key: 'store_phone', value: { phone: '+94771234567' } },
    { key: 'tax_rate', value: { rate: 0 } },
    { key: 'currency', value: { code: 'LKR', symbol: 'Rs.' } },
    { key: 'whatsapp_number', value: { number: '+94771234567' } },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log('✅ Site settings created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin: admin@sunsales.lk / Admin@123');
  console.log('   Customer: customer@example.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
