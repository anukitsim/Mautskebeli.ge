// app/(root)/api/reading/staff/route.js — marks an owner's device.
//
// Called by the dashboard while an owner is logged in. Sets a cookie so that
// this browser's own article reading is never counted, even after logout.

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/utils/stats/auth';
import { COOKIE_MAX_AGE_SECONDS, STAFF_COOKIE } from '@/utils/stats/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getAdminSession();
  if (!session) return new NextResponse(null, { status: 401 });

  const response = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(STAFF_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
