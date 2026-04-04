import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/otp';
import { rateLimitOTP } from '@/lib/rate-limit';
import { z } from 'zod';

const sendOTPSchema = z.object({
  email: z.string().email(),
  type: z.enum(['verification', 'password_reset']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendOTPSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 }
      );
    }

    const { email, type } = parsed.data;

    // Rate limit
    const rateLimitResult = rateLimitOTP(email);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait before requesting another code.' },
        { status: 429 }
      );
    }

    const result = await sendOTP(email, type);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
