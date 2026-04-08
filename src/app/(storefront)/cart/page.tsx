'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { useHydration } from '@/hooks/useHydration';
import { formatPrice } from '@/lib/formatters';
import { useCartStore, type CartItemLocal } from '@/stores/cartStore';

function CartLine({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItemLocal;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const linePrice = (item.salePrice ?? item.price) * item.quantity;

  return (
    <div className="flex gap-4 rounded-2xl border border-surface-border bg-white p-4 shadow-card">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-warm">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={item.image.startsWith('/images/')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-surface-border" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/shop/${item.slug}`} className="text-body-md font-semibold text-foreground hover:text-primary-600">
              {item.name}
            </Link>
            {item.variantName && <p className="mt-1 text-body-sm text-muted">{item.variantName}</p>}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface-warm hover:text-error-500"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-lg border border-surface-border">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={`Decrease quantity for ${item.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-9 min-w-10 items-center justify-center border-x border-surface-border px-2 text-body-sm font-semibold text-foreground">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={`Increase quantity for ${item.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <p className="text-price-sm font-bold text-foreground">{formatPrice(linePrice)}</p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const hydrated = useHydration();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-base py-6 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 rounded-2xl bg-surface-warm animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-surface-warm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }]} />

        <AnimatedSection className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-display-md font-display text-foreground">Your Cart</h1>
            <p className="mt-1 text-body-md text-muted">
              {items.length} item{items.length === 1 ? '' : 's'} ready for checkout.
            </p>
          </div>

          <Link href="/shop" className="hidden md:inline-flex">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </AnimatedSection>

        {items.length === 0 ? (
          <AnimatedSection delay={120}>
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse the collection and add something special to get started."
              action={
                <Link href="/shop">
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Start Shopping</Button>
                </Link>
              }
            />
          </AnimatedSection>
        ) : (
          <AnimatedSection delay={120} className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartLine
                  key={`${item.productId}-${item.variantId ?? 'none'}-${item.designId ?? 'none'}`}
                  item={item}
                  onRemove={() => removeItem(item.productId, item.variantId, item.designId)}
                  onUpdateQuantity={(quantity) => updateQuantity(item.productId, item.variantId, item.designId, quantity)}
                />
              ))}
            </div>

            <aside className="rounded-2xl border border-surface-border bg-white p-5 shadow-card lg:sticky lg:top-24 lg:h-fit">
              <h2 className="text-display-sm font-display text-foreground">Summary</h2>
              <div className="mt-5 space-y-3 text-body-md">
                <div className="flex items-center justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Shipping</span>
                  <span className="font-medium text-foreground">Calculated at checkout</span>
                </div>
              </div>

              <div className="my-4 border-t border-surface-border" />

              <div className="flex items-center justify-between">
                <span className="text-body-lg font-semibold text-foreground">Estimated total</span>
                <span className="text-price-md font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              <div className="mt-5 space-y-2.5">
                <Link href="/checkout">
                  <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button fullWidth variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </aside>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
