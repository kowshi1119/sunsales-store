import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemLocal {
  productId: string;
  variantId: string | null;
  quantity: number;
  designId: string | null;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  variantName: string | null;
  slug: string;
}

interface CartStore {
  items: CartItemLocal[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItemLocal) => void;
  removeItem: (productId: string, variantId: string | null, designId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, designId: string | null, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItemKey: (productId: string, variantId: string | null, designId: string | null) => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      getItemKey: (productId, variantId, designId) =>
        `${productId}-${variantId || 'none'}-${designId || 'none'}`,

      addItem: (item) => {
        set((state) => {
          const key = get().getItemKey(item.productId, item.variantId, item.designId);
          const existingIndex = state.items.findIndex(
            (i) => get().getItemKey(i.productId, i.variantId, i.designId) === key
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          return { items: [...state.items, item], isOpen: true };
        });
      },

      removeItem: (productId, variantId, designId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              get().getItemKey(i.productId, i.variantId, i.designId) !==
              get().getItemKey(productId, variantId, designId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, designId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId, designId);
          return;
        }

        set((state) => {
          const key = get().getItemKey(productId, variantId, designId);
          return {
            items: state.items.map((item) =>
              get().getItemKey(item.productId, item.variantId, item.designId) === key
                ? { ...item, quantity: Math.min(quantity, 99) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((total, item) => {
          const price = item.salePrice ?? item.price;
          return total + price * item.quantity;
        }, 0),
    }),
    {
      name: 'sun-sales-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
