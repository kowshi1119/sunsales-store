import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { profileSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load your profile.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid profile payload.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: parsed.data.fullName.trim(),
        phone: parsed.data.phone.trim(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update your profile.' }, { status: 500 });
  }
}
