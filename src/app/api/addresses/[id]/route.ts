import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DISTRICT_TO_PROVINCE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

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

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const existing = await prisma.address.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
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
    const province = data.province?.trim() || DISTRICT_TO_PROVINCE[data.district as keyof typeof DISTRICT_TO_PROVINCE] || '';

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || null,
          city: data.city.trim(),
          district: data.district,
          province: province || null,
          postalCode: data.postalCode.trim(),
          country: data.country?.trim() || 'Sri Lanka',
          isDefault: data.isDefault,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully.',
      data: serializeAddress(updated),
    });
  } catch (error) {
    console.error('Address PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update the address.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
    }

    const pendingOrderCount = await prisma.order.count({
      where: {
        addressId: address.id,
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.DESIGN_REVIEW,
            OrderStatus.DESIGN_APPROVED,
            OrderStatus.PRODUCTION,
            OrderStatus.SHIPPED,
          ],
        },
      },
    });

    if (pendingOrderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'This address is being used by an active order and cannot be deleted yet.',
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: address.id } });

      if (address.isDefault) {
        const nextDefault = await tx.address.findFirst({
          where: { userId: session.user.id },
          orderBy: { updatedAt: 'desc' },
        });

        if (nextDefault) {
          await tx.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    console.error('Address DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete the address.' }, { status: 500 });
  }
}
