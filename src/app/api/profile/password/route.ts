import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BCRYPT_ROUNDS } from '@/lib/constants';
import { changePasswordSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid password update payload.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const matches = await bcrypt.compare(parsed.data.currentPassword, user.password);

    if (!matches) {
      return NextResponse.json({ success: false, message: 'Your current password is incorrect.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Profile password PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update your password.' }, { status: 500 });
  }
}
