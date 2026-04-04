import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: true, message: 'You\'re already subscribed!' });
      }
      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true },
      });
      return NextResponse.json({ success: true, message: 'Welcome back! You\'ve been re-subscribed.' });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });

    return NextResponse.json({ success: true, message: 'You\'re subscribed! Watch your inbox for exclusive deals.' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
