import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { sendOTP } from '@/lib/otp';
import { rateLimitAuth } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = rateLimitAuth(ip);
    if (!rateLimitResult.success) {
      // Still return 200 to prevent enumeration
      return NextResponse.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check if user exists — but ALWAYS return success
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isActive) {
      await sendOTP(email, 'password_reset');
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you\'ll receive a reset code.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you\'ll receive a reset code.',
    });
  }
}
