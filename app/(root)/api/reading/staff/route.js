// app/(root)/api/reading/staff/route.js — marks an owner's device.
//
// Called by the dashboard while an owner is logged in. Sets a cookie so that
// this browser's own article reading is never counted, even after logout.

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/utils/stats/auth';
import { STAFF_COOKIE } from '@/utils/stats/config';
import { statsCookieOptions } from '@/utils/stats/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getAdminSession();
  if (!session) return new NextResponse(null, { status: 401 });

  const response = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(STAFF_COOKIE, '1', statsCookieOptions());
  return response;
}
