import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '@/lib/constants';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, message: firstError?.message || 'Invalid input.' },
        { status: 400 }
      );
    }

    const { token, email, password } = parsed.data;

    // Find the reset token
    const tokenRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: token,
        type: 'reset_token',
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.oTP.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      });
      return NextResponse.json(
        { success: false, message: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.oTP.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    // Invalidate all sessions for this user
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
