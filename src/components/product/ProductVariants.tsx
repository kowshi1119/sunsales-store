'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types/product';

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variant: ProductVariant) => void;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: '#1f2937',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#facc15',
  pink: '#ec4899',
  purple: '#8b5cf6',
  orange: '#f97316',
  gold: '#c9a84c',
  silver: '#94a3b8',
  gray: '#9ca3af',
  grey: '#9ca3af',
  navy: '#1b2d45',
};

function formatAttributeLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (value) => value.toUpperCase())
    .trim();
}

function getSwatchColor(value: string): string | null {
  if (value.startsWith('#')) {
    return value;
  }

  return COLOR_SWATCHES[value.toLowerCase()] ?? null;
}

export default function ProductVariants({ variants, selectedVariantId, onVariantChange }: ProductVariantsProps) {
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0] ?? null;

  const groupedAttributes = useMemo(() => {
    const groups = new Map<string, Map<string, { label: string; stock: number }>>();

    variants.forEach((variant) => {
      const entries = Object.entries(variant.attributes ?? {});

      if (entries.length === 0) {
        if (!groups.has('variant')) {
          groups.set('variant', new Map());
        }

        groups.get('variant')?.set(variant.name, {
          label: variant.name,
          stock: variant.stock,
        });
        return;
      }

      entries.forEach(([key, rawValue]) => {
        if (!groups.has(key)) {
          groups.set(key, new Map());
        }

        groups.get(key)?.set(String(rawValue), {
          label: String(rawValue),
          stock: variant.stock,
        });
      });
    });

    return Array.from(groups.entries()).map(([key, values]) => ({
      key,
      label: key === 'variant' ? 'Style' : formatAttributeLabel(key),
      options: Array.from(values.values()),
    }));
  }, [variants]);

  const selectedAttributes = selectedVariant?.attributes ?? {};

  const handleSelect = (groupKey: string, optionLabel: string) => {
    if (groupKey === 'variant') {
      const directVariant = variants.find((variant) => variant.name === optionLabel);
      if (directVariant) {
        onVariantChange(directVariant);
      }
      return;
    }

    const nextAttributes: Record<string, string> = {
      ...selectedAttributes,
      [groupKey]: optionLabel,
    };

    const exactMatch = variants.find((variant) => {
      const attributes = variant.attributes ?? {};
      return Object.entries(nextAttributes).every(([key, value]) => String(attributes[key]) === value);
    });

    const fallback = variants.find((variant) => String((variant.attributes ?? {})[groupKey]) === optionLabel);
    const nextVariant = exactMatch ?? fallback;

    if (nextVariant) {
      onVariantChange(nextVariant);
    }
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {groupedAttributes.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-body-sm font-semibold text-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = group.key === 'variant'
                ? selectedVariant?.name === option.label
                : String(selectedAttributes[group.key] ?? '') === option.label;
              const swatchColor = group.key.toLowerCase().includes('color') ? getSwatchColor(option.label) : null;
              const isDisabled = option.stock < 1;

              return (
                <button
                  key={`${group.key}-${option.label}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(group.key, option.label)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-body-sm transition-all',
                    isSelected
                      ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-surface-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50',
                    isDisabled && 'cursor-not-allowed opacity-50 line-through'
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${group.label}: ${option.label}`}
                >
                  {swatchColor && (
                    <span
                      className="h-4 w-4 rounded-full border border-surface-border"
                      style={{ backgroundColor: swatchColor }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
