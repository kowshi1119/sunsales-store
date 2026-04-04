export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  type: ProductType;
  basePrice: number;
  salePrice: number | null;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  viewCount: number;
  soldCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: { category: CategoryBasic }[];
  createdAt: string;
  updatedAt: string;
}

export type ProductType =
  | 'STANDARD'
  | 'CUSTOMIZABLE_PHONE_COVER'
  | 'CUSTOMIZABLE_FRAME'
  | 'CUSTOMIZABLE_OTHER';

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number;
  attributes: Record<string, string>;
  image: string | null;
  isActive: boolean;
}

export interface Product360Image {
  id: string;
  url: string;
  frameIndex: number;
}

export interface Product3DModel {
  id: string;
  modelUrl: string;
  format: string;
}

export interface ProductCustomizationConfig {
  id: string;
  allowImageUpload: boolean;
  allowText: boolean;
  maxImages: number;
  maxTextLength: number;
  availableFonts: string[];
  availableColors: string[];
  mockupImages: unknown;
}

export interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  children: CategoryBasic[];
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  type: ProductType;
  basePrice: number;
  salePrice: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  avgRating: number;
  reviewCount: number;
  images: ProductImage[];
  categories: { category: CategoryBasic }[];
}

export interface ProductsResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProductReview {
  id: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  isVerified: boolean;
  adminReply: string | null;
  createdAt: string;
  user: {
    fullName: string;
    avatar: string | null;
  };
}

export interface ProductDetail extends Product {
  weight: number | null;
  customizationConfig?: ProductCustomizationConfig | null;
  model3d?: Product3DModel | null;
  images360?: Product360Image[];
  reviews: ProductReview[];
}
