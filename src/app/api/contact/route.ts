import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = rateLimit(`contact:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { success: false, message: firstError?.message || 'Invalid input.' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Create support ticket
    await prisma.supportTicket.create({
      data: { name, email, subject, message },
    });

    // Send notification to admin
    await sendEmail({
      to: process.env.EMAIL_FROM || 'admin@sunsales.lk',
      subject: `New Contact: ${subject}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
