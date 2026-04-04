import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from './constants';

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface UploadValidation {
  valid: boolean;
  error?: string;
}

/** Validate a file before upload */
export function validateImageFile(file: File): UploadValidation {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split('/')[1]).join(', ')}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const maxMB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);
    return { valid: false, error: `File too large. Maximum size is ${maxMB}MB.` };
  }

  return { valid: true };
}

/** Upload image to Cloudinary via server-side API */
export async function uploadImage(
  file: File,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || 'Upload failed' };
    }

    const data = await res.json();
    return {
      success: true,
      url: data.data.url,
      publicId: data.data.publicId,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed. Please try again.' };
  }
}

/** Get image dimensions from a File */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/** Check print quality based on image dimensions and print area */
export function checkPrintQuality(
  imageWidth: number,
  imageHeight: number,
  printWidthInches: number,
  printHeightInches: number
): { level: 'excellent' | 'acceptable' | 'poor'; dpi: number; message: string } {
  const dpiW = imageWidth / printWidthInches;
  const dpiH = imageHeight / printHeightInches;
  const dpi = Math.min(dpiW, dpiH);

  if (dpi >= 300) {
    return { level: 'excellent', dpi: Math.round(dpi), message: 'Excellent quality for printing' };
  }

  if (dpi >= 150) {
    return { level: 'acceptable', dpi: Math.round(dpi), message: 'Acceptable quality — may have slight blur' };
  }

  return {
    level: 'poor',
    dpi: Math.round(dpi),
    message: 'Low resolution — may look pixelated. Upload a higher quality image.',
  };
}
