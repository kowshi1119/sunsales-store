import { useCartStore, type CartItemLocal } from '@/stores/cartStore';
import { useHydration } from './useHydration';
import toast from 'react-hot-toast';

/** Convenience hook for cart operations with hydration safety and toast feedback */
export function useCart() {
  const hydrated = useHydration();
  const store = useCartStore();

  const addToCart = (item: CartItemLocal) => {
    store.addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (productId: string, variantId: string | null, designId: string | null, name: string) => {
    store.removeItem(productId, variantId, designId);
    toast.success(`${name} removed from cart`);
  };

  return {
    items: hydrated ? store.items : [],
    itemCount: hydrated ? store.getItemCount() : 0,
    subtotal: hydrated ? store.getSubtotal() : 0,
    isOpen: store.isOpen,
    addToCart,
    removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
    hydrated,
  };
}
