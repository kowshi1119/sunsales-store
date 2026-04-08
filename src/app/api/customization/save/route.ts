import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, ProductType } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { customizationSaveSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

async function uploadDataUri(dataUri: string, folder: string) {
  if (!dataUri.startsWith('data:')) {
    return dataUri;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return dataUri;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const crypto = await import('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(`folder=sun-sales/${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', `sun-sales/${folder}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.error('Customization upload error:', data);
    throw new Error('Failed to upload the design preview.');
  }

  const result = await response.json();
  return result.secure_url as string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Please log in to save your custom design.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = customizationSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid customization payload.',
        },
        { status: 400 }
      );
    }

    const phoneModel = await prisma.phoneModel.findFirst({
      where: {
        id: parsed.data.phoneModelId,
        isActive: true,
      },
      include: {
        brand: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!phoneModel) {
      return NextResponse.json(
        { success: false, message: 'Selected phone model could not be found.' },
        { status: 404 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        isActive: true,
        type: ProductType.CUSTOMIZABLE_PHONE_COVER,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'A customizable phone cover product is not available yet.' },
        { status: 404 }
      );
    }

    const selectedVariant = product.variants.find((variant) => {
      const caseType = parsed.data.caseType.toLowerCase();
      return variant.name.toLowerCase().includes(caseType);
    }) ?? product.variants[0] ?? null;

    const previewImage = await uploadDataUri(parsed.data.previewImage, 'customization/previews');
    const uploadedImages = await Promise.all(
      parsed.data.uploadedImages.map((image, index) => uploadDataUri(image, `customization/originals/${index + 1}`))
    );

    const savedDesign = await prisma.savedDesign.create({
      data: {
        userId: session.user.id,
        type: ProductType.CUSTOMIZABLE_PHONE_COVER,
        designData: parsed.data.designData as Prisma.InputJsonValue,
        previewImage,
        uploadedImages,
        phoneModelId: phoneModel.id,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your custom phone cover has been saved.',
      data: {
        designId: savedDesign.id,
        phoneModel: {
          id: phoneModel.id,
          name: phoneModel.name,
          brandName: phoneModel.brand.name,
        },
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: Number(product.basePrice),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          image: product.images[0]?.url ?? previewImage,
        },
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              price: selectedVariant.price ? Number(selectedVariant.price) : Number(product.basePrice),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Customization save API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save the custom phone cover.' },
      { status: 500 }
    );
  }
}
