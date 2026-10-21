// app/admin/_lib/guard.js — every dashboard page starts with requireAdmin().

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/utils/stats/auth';

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
