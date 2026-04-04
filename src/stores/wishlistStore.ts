import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============ WISHLIST STORE ============

interface WishlistStore {
  items: string[]; // Product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId) => {
        const isInList = get().items.includes(productId);
        if (isInList) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'sun-sales-wishlist' }
  )
);

// ============ UI STORE ============

interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  activeModal: null,
  modalData: null,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  openModal: (id, data) => set({ activeModal: id, modalData: data ?? null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
