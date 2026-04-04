import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        sortOrder: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    const serialized = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}
