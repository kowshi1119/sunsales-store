'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/Skeleton';
import { checkPrintQuality, getImageDimensions, validateImageFile } from '@/lib/upload';
import { cn } from '@/lib/utils';
import type { ImageQuality, PrintArea } from '@/types/customization';

interface ImageUploadAreaProps {
  printArea: PrintArea | null;
  onImageReady: (dataUrl: string, quality: ImageQuality, fileName: string) => void;
  className?: string;
}

export default function ImageUploadArea({ printArea, onImageReady, className }: ImageUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQuality | null>(null);

  const estimatedPrintWidth = Math.max((printArea?.width ?? 300) / 150, 2);
  const estimatedPrintHeight = Math.max((printArea?.height ?? 550) / 150, 3);

  const processFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage(validation.error || 'Unsupported file.');
      setQuality(null);
      return;
    }

    try {
      const dimensions = await getImageDimensions(file);
      const nextQuality = checkPrintQuality(
        dimensions.width,
        dimensions.height,
        estimatedPrintWidth,
        estimatedPrintHeight
      );

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }
          reject(new Error('Unable to read file.'));
        };
        reader.onerror = () => reject(new Error('Unable to read file.'));
        reader.readAsDataURL(file);
      });

      setQuality(nextQuality);
      setMessage(`${file.name} is ready for your design canvas.`);
      onImageReady(dataUrl, nextQuality, file.name);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not prepare the image.');
      setQuality(null);
    }
  };

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const qualityVariant = quality?.level === 'excellent'
    ? 'success'
    : quality?.level === 'acceptable'
    ? 'warning'
    : 'error';

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleInput}
        aria-label="Upload design image"
        title="Upload design image"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={cn(
          'rounded-2xl border-2 border-dashed p-4 text-left transition-colors',
          dragActive ? 'border-primary-400 bg-primary-50' : 'border-surface-border bg-white hover:border-primary-300 hover:bg-surface-warm'
        )}
        aria-label="Upload an image for the phone cover design"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            {dragActive ? <UploadCloud className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-body-sm font-semibold text-foreground">Upload artwork</p>
            <p className="text-body-xs text-muted">Drag & drop or click to add a JPEG, PNG, WebP, or AVIF file up to 10MB.</p>
          </div>
        </div>
      </div>

      {quality && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={qualityVariant} dot>
            {quality.level === 'excellent' ? 'Excellent quality' : quality.level === 'acceptable' ? 'Acceptable quality' : 'Low quality'}
          </Badge>
          <span className="text-body-xs text-muted">{quality.dpi} DPI • {quality.message}</span>
        </div>
      )}

      {message && (
        <p className={cn('flex items-center gap-1 text-body-xs', quality ? 'text-success-700' : 'text-error-600')}>
          {quality ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {message}
        </p>
      )}
    </div>
  );
}
