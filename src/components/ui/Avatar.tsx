'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; icon: string; pixels: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', icon: 'h-3 w-3', pixels: 24 },
  sm: { container: 'w-8 h-8', text: 'text-body-xs', icon: 'h-4 w-4', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-body-sm', icon: 'h-5 w-5', pixels: 40 },
  lg: { container: 'w-14 h-14', text: 'text-body-md', icon: 'h-6 w-6', pixels: 56 },
  xl: { container: 'w-20 h-20', text: 'text-body-lg', icon: 'h-8 w-8', pixels: 80 },
};

export default function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const styles = sizeMap[size];
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', styles.container, className)}>
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          fill
          sizes={`${styles.pixels}px`}
          className="object-cover"
          unoptimized={src.startsWith('/images/')}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (name) {
    return (
      <div
        className={cn(
          'rounded-full flex-shrink-0 bg-gradient-to-br from-primary-200 to-accent-cream flex items-center justify-center',
          styles.container,
          className
        )}
        aria-label={name}
      >
        <span className={cn('font-bold text-primary-700 select-none', styles.text)}>
          {getInitials(name)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 bg-surface-warm flex items-center justify-center',
        styles.container,
        className
      )}
    >
      <User className={cn('text-muted-light', styles.icon)} />
    </div>
  );
}
