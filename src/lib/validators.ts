import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from './constants';

// ============ AUTH VALIDATORS ============

/** Sri Lankan phone number pattern */
const phoneRegex = /^(\+94|0)\d{9}$/;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid Sri Lankan phone number (+94XXXXXXXXX or 0XXXXXXXXX)'),
  acceptTerms: z
    .literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  type: z.enum(['verification', 'password_reset']),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

// ============ PRODUCT VALIDATORS ============

export const productFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  type: z.enum(['STANDARD', 'CUSTOMIZABLE_PHONE_COVER', 'CUSTOMIZABLE_FRAME', 'CUSTOMIZABLE_OTHER']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular', 'rating']).default('newest'),
  featured: z.coerce.boolean().optional(),
  bestSeller: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;

// ============ ADDRESS VALIDATORS ============

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100).trim(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address is required').max(200).trim(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').trim(),
  district: z.string().min(2, 'District is required'),
  province: z.string().optional(),
  postalCode: z.string().min(4, 'Postal code is required').max(10),
  country: z.string().default('Sri Lanka'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============ REVIEW VALIDATORS ============

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ============ CONTACT VALIDATORS ============

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100).trim(),
  email: z.string().email('Invalid email').trim(),
  subject: z.string().min(5, 'Subject is required').max(200).trim(),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============ NEWSLETTER VALIDATORS ============

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email').toLowerCase().trim(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ============ COUPON VALIDATORS ============

export const couponValidateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
  subtotal: z.number().min(0),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;

// ============ CHECKOUT VALIDATORS ============

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Please select a delivery address'),
  paymentMethod: z.enum(['PAYHERE', 'CASH_ON_DELIVERY'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  giftMessage: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ============ ADMIN VALIDATORS ============

export const adminProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(500).optional(),
  type: z.enum(['STANDARD', 'CUSTOMIZABLE_PHONE_COVER', 'CUSTOMIZABLE_FRAME', 'CUSTOMIZABLE_OTHER']),
  basePrice: z.coerce.number().min(0, 'Price must be positive'),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

// ============ PROFILE VALIDATORS ============

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100).trim(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[a-z]/, 'Must contain lowercase')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
