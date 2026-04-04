'use client';

import Image from 'next/image';
import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/formatters';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/lib/constants';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploaderProps {
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  className?: string;
  label?: string;
  hint?: string;
  error?: string;
  accept?: string[];
  maxSizeMB?: number;
}

export default function ImageUploader({
  maxFiles = 1,
  onFilesChange,
  className,
  label,
  hint,
  error,
  accept = ALLOWED_IMAGE_TYPES,
  maxSizeMB = MAX_IMAGE_SIZE_MB,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!accept.includes(file.type)) {
        return `Invalid file type. Accepted: ${accept.map((t) => t.split('/')[1]).join(', ')}`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size: ${maxSizeMB}MB (yours: ${formatFileSize(file.size)})`;
      }
      return null;
    },
    [accept, maxSizeMB]
  );

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const remainingSlots = maxFiles - images.length;

      if (remainingSlots <= 0) {
        setValidationError(`Maximum ${maxFiles} image${maxFiles !== 1 ? 's' : ''} allowed.`);
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const newImages: UploadedImage[] = [];

      for (const file of filesToProcess) {
        const err = validateFile(file);
        if (err) {
          setValidationError(err);
          return;
        }
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
      }

      setValidationError(null);
      const updated = [...images, ...newImages];
      setImages(updated);
      onFilesChange(updated.map((i) => i.file));
    },
    [images, maxFiles, validateFile, onFilesChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => {
      if (img.id === id) {
        URL.revokeObjectURL(img.preview);
        return false;
      }
      return true;
    });
    setImages(updated);
    onFilesChange(updated.map((i) => i.file));
    setValidationError(null);
  };

  const displayError = error || validationError;
  const canAddMore = images.length < maxFiles;

  return (
    <div className={className}>
      {label && (
        <label className="text-body-sm font-medium text-foreground block mb-1.5">
          {label}
        </label>
      )}

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img) => (
            <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden bg-surface-warm border border-surface-border">
              <Image src={img.preview} alt="Upload preview" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept.join(',')}
            multiple={maxFiles > 1}
            onChange={handleChange}
            className="hidden"
            aria-label={label || 'Upload images'}
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
              dragOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm',
              displayError && 'border-error-500'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-surface-warm flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">
                {dragOver ? 'Drop here' : 'Click or drag to upload'}
              </p>
              <p className="text-body-xs text-muted mt-0.5">
                {hint || `PNG, JPG, WebP up to ${maxSizeMB}MB`}
              </p>
            </div>
            </div>
          </div>
        </>
      )}

      {displayError && (
        <p className="flex items-center gap-1 text-body-xs text-error-500 mt-1.5">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
}
