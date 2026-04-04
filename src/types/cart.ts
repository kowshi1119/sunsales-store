import { ProductImage, ProductVariant } from './product';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  designId: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    type: string;
    images: ProductImage[];
  };
  variant: ProductVariant | null;
  designPreview?: string | null;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  couponCode: string | null;
}
