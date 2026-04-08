import { NextResponse } from 'next/server';
import { getDashboardSnapshot, requireAdminSession } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Admin access required.' },
      { status: 403 }
    );
  }

  const data = await getDashboardSnapshot();

  return NextResponse.json({
    success: true,
    message: 'Dashboard data fetched successfully.',
    data,
  });
}
