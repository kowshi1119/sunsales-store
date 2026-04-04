'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, ImageOff } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedVariantImage?: string | null;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

export default function ProductGallery({ images, productName, selectedVariantImage }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const galleryImages = useMemo<GalleryImage[]>(() => {
    const normalized = images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
    }));

    if (selectedVariantImage && !normalized.some((image) => image.url === selectedVariantImage)) {
      return [
        {
          id: 'selected-variant-image',
          url: selectedVariantImage,
          alt: `${productName} selected variant`,
        },
        ...normalized,
      ];
    }

    return normalized;
  }, [images, productName, selectedVariantImage]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedVariantImage]);

  const currentImage = galleryImages[currentIndex] ?? null;

  const goToPrevious = () => {
    setCurrentIndex((index) => (index === 0 ? galleryImages.length - 1 : index - 1));
  };

  const goToNext = () => {
    setCurrentIndex((index) => (index === galleryImages.length - 1 ? 0 : index + 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || galleryImages.length < 2) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const difference = touchStartX.current - touchEndX;

    if (difference > 40) {
      goToNext();
    } else if (difference < -40) {
      goToPrevious();
    }

    touchStartX.current = null;
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-square overflow-hidden bg-surface-warm">
          {currentImage ? (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="group relative block h-full w-full cursor-zoom-in"
              aria-label={`Open image ${currentIndex + 1} of ${galleryImages.length} in full screen`}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.alt || productName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={currentImage.url.startsWith('/images/')}
              />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-body-xs font-medium text-white">
                <Expand className="h-3.5 w-3.5" />
                Tap to zoom
              </span>
            </button>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-muted">
              <ImageOff className="h-10 w-10 text-muted-light" />
              <p className="text-body-sm">Image preview unavailable</p>
            </div>
          )}

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white"
                aria-label="Show previous product image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white"
                aria-label="Show next product image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-body-xs font-medium text-white">
                {currentIndex + 1} / {galleryImages.length}
              </span>
            </>
          )}
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border bg-white transition-all',
                currentIndex === index
                  ? 'border-primary-400 shadow-md shadow-primary-400/15'
                  : 'border-surface-border hover:border-primary-300'
              )}
              aria-label={`Show product image ${index + 1}`}
              aria-current={currentIndex === index}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized={image.url.startsWith('/images/')}
              />
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} size="xl" className="bg-transparent shadow-none" showClose>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-surface-warm">
            {currentImage && (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || productName}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  unoptimized={currentImage.url.startsWith('/images/')}
                />
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPrevious}
                className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-white px-3 py-2 text-body-sm text-foreground transition-colors hover:bg-surface-warm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-body-sm text-muted">
                {currentIndex + 1} of {galleryImages.length}
              </span>
              <button
                type="button"
                onClick={goToNext}
                className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-white px-3 py-2 text-body-sm text-foreground transition-colors hover:bg-surface-warm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
