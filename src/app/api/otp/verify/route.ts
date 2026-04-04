import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { verifyOTPSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { sendEmail, welcomeEmailTemplate } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyOTPSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, message: firstError?.message || 'Invalid input.' },
        { status: 400 }
      );
    }

    const { email, code, type } = parsed.data;

    // Verify OTP
    const result = await verifyOTP(email, code, type);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    if (type === 'verification') {
      // Mark user as verified
      const user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });

      // Send welcome email
      await sendEmail({
        to: email,
        subject: 'Welcome to Sun Sales! ☀️',
        html: welcomeEmailTemplate(user.fullName),
      });

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now sign in.',
      });
    }

    if (type === 'password_reset') {
      // Generate a time-limited reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the token temporarily in OTP table (reusing infrastructure)
      await prisma.oTP.create({
        data: {
          email,
          code: resetToken,
          type: 'reset_token',
          expiresAt: tokenExpiry,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Verification successful.',
        data: { token: resetToken },
      });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
