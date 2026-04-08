/** Application-wide constants */

export const SITE_NAME = 'Sun Sales';
export const SITE_DESCRIPTION = 'Premium gifts, custom phone covers & personalized photo frames. Sri Lanka\'s favorite gifting destination.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+94XXXXXXXXX';

/** Default currency */
export const DEFAULT_CURRENCY = 'LKR';
export const DEFAULT_CURRENCY_SYMBOL = 'Rs.';

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

/** Image upload limits */
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_REVIEW_IMAGES = 5;

/** Auth settings */
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MINUTES = 1;
export const OTP_MAX_RESENDS_PER_WINDOW = 3;
export const OTP_RESEND_WINDOW_MINUTES = 15;
export const PASSWORD_MIN_LENGTH = 8;
export const BCRYPT_ROUNDS = 12;
export const SESSION_MAX_AGE_DAYS = 30;
export const RESET_TOKEN_EXPIRY_MINUTES = 15;

/** Rate limiting */
export const RATE_LIMIT_AUTH = { maxRequests: 5, windowMinutes: 15 };
export const RATE_LIMIT_OTP = { maxRequests: 3, windowMinutes: 15 };
export const RATE_LIMIT_API = { maxRequests: 100, windowMinutes: 1 };

/** Product customization */
export const MIN_PRINT_DPI = 300;
export const PRINT_QUALITY_THRESHOLDS = {
  excellent: 300,
  acceptable: 150,
  poor: 0,
} as const;

/** Sri Lankan districts for shipping */
export const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
] as const;

/** Sri Lankan provinces */
export const SRI_LANKA_PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
] as const;

/** District to province lookup for checkout/address forms */
export const DISTRICT_TO_PROVINCE: Record<(typeof SRI_LANKA_DISTRICTS)[number], (typeof SRI_LANKA_PROVINCES)[number]> = {
  Colombo: 'Western',
  Gampaha: 'Western',
  Kalutara: 'Western',
  Kandy: 'Central',
  Matale: 'Central',
  'Nuwara Eliya': 'Central',
  Galle: 'Southern',
  Matara: 'Southern',
  Hambantota: 'Southern',
  Jaffna: 'Northern',
  Kilinochchi: 'Northern',
  Mannar: 'Northern',
  Mullaitivu: 'Northern',
  Vavuniya: 'Northern',
  Trincomalee: 'Eastern',
  Batticaloa: 'Eastern',
  Ampara: 'Eastern',
  Kurunegala: 'North Western',
  Puttalam: 'North Western',
  Anuradhapura: 'North Central',
  Polonnaruwa: 'North Central',
  Badulla: 'Uva',
  Monaragala: 'Uva',
  Ratnapura: 'Sabaragamuwa',
  Kegalle: 'Sabaragamuwa',
};

/** Navigation links */
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Custom Phone Covers', href: '/customize/phone-cover' },
  { label: 'Custom Photo Frames', href: '/customize/photo-frame' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Footer links */
export const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Best Sellers', href: '/shop?filter=bestseller' },
    { label: 'Custom Phone Covers', href: '/customize/phone-cover' },
    { label: 'Custom Photo Frames', href: '/customize/photo-frame' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Info', href: '/faq#shipping' },
    { label: 'Returns & Exchanges', href: '/return-policy' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
} as const;

/** Social links */
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/sunsales',
  instagram: 'https://instagram.com/sunsales',
  tiktok: 'https://tiktok.com/@sunsales',
  twitter: 'https://twitter.com/sunsales',
} as const;
