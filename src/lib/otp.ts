import prisma from './prisma';
import { sendEmail, otpEmailTemplate } from './email';
import { generateOTP } from './utils';
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from './constants';

interface OTPResult {
  success: boolean;
  message: string;
}

/** Generate and send an OTP to the given email */
export async function sendOTP(
  email: string,
  type: 'verification' | 'password_reset'
): Promise<OTPResult> {
  try {
    // Invalidate any existing OTPs for this email and type
    await prisma.oTP.updateMany({
      where: { email, type, used: false },
      data: { used: true },
    });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store in database
    await prisma.oTP.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      },
    });

    // Send email
    const subject =
      type === 'verification'
        ? 'Verify your Sun Sales account'
        : 'Reset your Sun Sales password';

    const emailSent = await sendEmail({
      to: email,
      subject,
      html: otpEmailTemplate(code, type),
      text: `Your ${type === 'verification' ? 'verification' : 'password reset'} code is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    if (!emailSent) {
      return { success: false, message: 'Failed to send verification email. Please try again.' };
    }

    return { success: true, message: 'Verification code sent to your email.' };
  } catch (error) {
    console.error('OTP send error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

/** Verify an OTP code */
export async function verifyOTP(
  email: string,
  code: string,
  type: 'verification' | 'password_reset'
): Promise<OTPResult> {
  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        type,
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return { success: false, message: 'No active verification code found. Please request a new one.' };
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      return { success: false, message: 'Too many attempts. Please request a new code.' };
    }

    // Check code
    if (otpRecord.code !== code) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      const remaining = OTP_MAX_ATTEMPTS - otpRecord.attempts - 1;
      return {
        success: false,
        message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      };
    }

    // Mark as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return { success: true, message: 'Code verified successfully.' };
  } catch (error) {
    console.error('OTP verify error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}
