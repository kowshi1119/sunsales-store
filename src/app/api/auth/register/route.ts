import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';
import { sendOTP } from '@/lib/otp';
import { BCRYPT_ROUNDS } from '@/lib/constants';
import { rateLimitAuth } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = rateLimitAuth(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, message: firstError?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone } = parsed.data;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone,
        emailVerified: false,
      },
    });

    // Send OTP
    const otpResult = await sendOTP(email, 'verification');
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, message: otpResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account created! Check your email for the verification code.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
