import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DISTRICT_TO_PROVINCE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

function serializeAddress(address: {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...address,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: addresses.map(serializeAddress),
    });
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load addresses.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Please review the address fields.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const addressCount = await prisma.address.count({ where: { userId: session.user.id } });
    const province = data.province?.trim() || DISTRICT_TO_PROVINCE[data.district as keyof typeof DISTRICT_TO_PROVINCE] || '';
    const shouldSetDefault = data.isDefault || addressCount === 0;

    const address = await prisma.$transaction(async (tx) => {
      if (shouldSetDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: session.user.id,
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || null,
          city: data.city.trim(),
          district: data.district,
          province: province || null,
          postalCode: data.postalCode.trim(),
          country: data.country?.trim() || 'Sri Lanka',
          isDefault: shouldSetDefault,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Address saved successfully.',
        data: serializeAddress(address),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Addresses POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save the address.' }, { status: 500 });
  }
}
