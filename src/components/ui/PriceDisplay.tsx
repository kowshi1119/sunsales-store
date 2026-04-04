'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { calculateDiscount } from '@/lib/utils';
import { Star, Minus, Plus } from 'lucide-react';

// ============ PRICE DISPLAY ============
interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

export function PriceDisplay({ price, salePrice, size = 'md', showDiscount = true, className }: PriceDisplayProps) {
  const isOnSale = salePrice != null && salePrice < price;
  const discount = isOnSale ? calculateDiscount(price, salePrice) : 0;

  const sizeStyles = {
    sm: { current: 'text-price-sm', original: 'text-body-xs' },
    md: { current: 'text-price-md', original: 'text-body-sm' },
    lg: { current: 'text-price-lg', original: 'text-body-md' },
  };

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn(sizeStyles[size].current, 'font-body font-bold text-foreground')}>
        {formatPrice(isOnSale ? salePrice : price)}
      </span>
      {isOnSale && (
        <>
          <span className={cn(sizeStyles[size].original, 'text-muted line-through')}>
            {formatPrice(price)}
          </span>
          {showDiscount && discount > 0 && (
            <span className="badge-sale text-body-xs">-{discount}%</span>
          )}
        </>
      )}
    </div>
  );
}

// ============ STAR RATING ============
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className={cn('flex items-center gap-1', className)} role={interactive ? 'radiogroup' : undefined}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isPartial = !isFilled && starValue <= Math.ceil(rating);
          const fillPercentage = isPartial ? (rating - Math.floor(rating)) * 100 : 0;

          const starEl = (
            <span key={i} className="relative inline-flex">
              {/* Background star (empty) */}
              <Star
                className={cn(sizeMap[size], 'text-surface-border fill-surface-border')}
                strokeWidth={0}
              />
              {/* Foreground star (filled) */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: isFilled ? '100%' : `${fillPercentage}%` }}
              >
                <Star
                  className={cn(sizeMap[size], 'text-primary-400 fill-primary-400')}
                  strokeWidth={0}
                />
              </span>
            </span>
          );

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange?.(starValue)}
                className="p-0.5 hover:scale-110 transition-transform"
                role="radio"
                aria-checked={starValue === Math.round(rating)}
                aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              >
                {starValue <= Math.round(rating) ? (
                  <Star className={cn(sizeMap[size], 'text-primary-400 fill-primary-400')} strokeWidth={0} />
                ) : (
                  <Star className={cn(sizeMap[size], 'text-surface-border fill-surface-border')} strokeWidth={0} />
                )}
              </button>
            );
          }

          return starEl;
        })}
      </div>
      {showValue && (
        <span className="text-body-sm font-semibold text-foreground ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="text-body-xs text-muted">
          ({count})
        </span>
      )}
    </div>
  );
}

// ============ QUANTITY SELECTOR ============
interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const isSmall = size === 'sm';

  return (
    <div className={cn('inline-flex items-center border border-surface-border rounded-md', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={cn(
          'flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-l-md',
          isSmall ? 'w-7 h-7' : 'w-9 h-9'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={isSmall ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
      <span
        className={cn(
          'flex items-center justify-center font-medium text-foreground border-x border-surface-border select-none',
          isSmall ? 'w-8 h-7 text-body-sm' : 'w-11 h-9 text-body-md'
        )}
        aria-live="polite"
        aria-label={`Quantity: ${quantity}`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={cn(
          'flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-r-md',
          isSmall ? 'w-7 h-7' : 'w-9 h-9'
        )}
        aria-label="Increase quantity"
      >
        <Plus className={isSmall ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
