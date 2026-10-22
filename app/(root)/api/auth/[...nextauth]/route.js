// app/(root)/api/auth/[...nextauth]/route.js — login endpoints for /admin.
// Answers 404 until login is configured, so it can't error in production.

import NextAuth from 'next-auth';
import { authOptions, isAuthConfigured } from '@/utils/stats/auth';

export const runtime = 'nodejs';

const handler = NextAuth(authOptions);

async function guarded(request, context) {
  if (!isAuthConfigured()) return new Response('Not found', { status: 404 });
  return handler(request, context);
}

export { guarded as GET, guarded as POST };
