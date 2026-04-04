import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const folderEntry = formData.get('folder');
    const folder =
      typeof folderEntry === 'string' && /^[a-zA-Z0-9/_-]+$/.test(folderEntry)
        ? folderEntry
        : 'uploads';

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No valid file provided.' },
        { status: 400 }
      );
    }

    const file = fileEntry;

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const maxMB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size is ${maxMB}MB.` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Dev fallback: return a placeholder URL
      console.warn('Cloudinary not configured — returning placeholder URL');
      return NextResponse.json({
        success: true,
        data: {
          url: `/images/placeholders/uploaded-${Date.now()}.jpg`,
          publicId: `placeholder-${Date.now()}`,
          width: 800,
          height: 800,
        },
      });
    }

    // Convert file to base64 for Cloudinary upload API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Cloudinary unsigned upload via REST API
    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`folder=sun-sales/${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', base64);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('timestamp', timestamp.toString());
    cloudinaryForm.append('signature', signature);
    cloudinaryForm.append('folder', `sun-sales/${folder}`);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudinaryForm }
    );

    if (!cloudinaryRes.ok) {
      const errorData = await cloudinaryRes.json().catch(() => ({}));
      console.error('Cloudinary upload error:', errorData);
      return NextResponse.json(
        { success: false, message: 'Image upload failed. Please try again.' },
        { status: 500 }
      );
    }

    const cloudinaryData = await cloudinaryRes.json();

    return NextResponse.json({
      success: true,
      data: {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
      },
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
