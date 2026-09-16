import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS } from '@/lib/server/adminAuth';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Admin session terminated successfully.' },
    { status: 200 }
  );

  response.cookies.set({
    ...ADMIN_COOKIE_OPTIONS,
    name: ADMIN_COOKIE_NAME,
    value: '',
    maxAge: 0
  });

  return response;
}
