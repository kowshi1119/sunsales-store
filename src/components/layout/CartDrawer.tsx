'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore, type CartItemLocal } from '@/stores/cartStore';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <h2 className="font-display text-lg font-bold text-foreground">Your Cart</h2>
            {itemCount > 0 && (
              <span className="ml-1 min-w-[22px] h-[22px] flex items-center justify-center bg-primary-400 text-white text-body-xs font-bold rounded-full px-1.5">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-muted hover:text-foreground hover:bg-surface-warm rounded-md transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-5">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet. Start browsing our collection!"
              action={
                <Link href="/shop" onClick={closeCart}>
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Start Shopping
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <CartDrawerItem
                  key={`${item.productId}-${item.variantId}-${item.designId}`}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.productId, item.variantId, item.designId, qty)}
                  onRemove={() => removeItem(item.productId, item.variantId, item.designId)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-surface-border px-5 py-5 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Subtotal</span>
                <span className="text-price-md font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-body-xs text-muted">Shipping and taxes calculated at checkout.</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/checkout" onClick={closeCart}>
                  <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart}>
                  <Button variant="outline" fullWidth>
                    View Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ Cart Drawer Item ============
function CartDrawerItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItemLocal;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const price = item.salePrice ?? item.price;

  return (
    <div className="flex gap-3 group">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-surface-warm rounded-lg overflow-hidden flex items-center justify-center">
        {item.image ? (
          <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" unoptimized={item.image.startsWith('/images/placeholders')} />
        ) : (
          <ShoppingBag className="h-6 w-6 text-surface-border" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/shop/${item.slug}`} className="text-body-sm font-medium text-foreground hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
          {item.name}
        </Link>
        {item.variantName && (
          <p className="text-body-xs text-muted mt-0.5">{item.variantName}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="inline-flex items-center border border-surface-border rounded-md">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label="Decrease"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 h-7 flex items-center justify-center text-body-xs font-medium border-x border-surface-border">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label="Increase"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-body-sm font-bold text-foreground">{formatPrice(price * item.quantity)}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 text-muted-light hover:text-error-500 opacity-0 group-hover:opacity-100 transition-all self-start"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
