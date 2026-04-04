import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandSlug = searchParams.get('brand');

    // If brand specified, return models for that brand
    if (brandSlug) {
      const brand = await prisma.phoneBrand.findUnique({
        where: { slug: brandSlug },
        include: {
          models: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
              id: true,
              name: true,
              slug: true,
              mockupImage: true,
              printArea: true,
              caseTypes: true,
            },
          },
        },
      });

      if (!brand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: brand });
    }

    // Return all brands with model counts
    const brands = await prisma.phoneBrand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: { select: { models: { where: { isActive: true } } } },
      },
    });

    const serialized = brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      modelCount: b._count.models,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Phone models API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch phone models.' },
      { status: 500 }
    );
  }
}
