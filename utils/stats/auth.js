// utils/stats/auth.js — owners-only login for /admin (server only).
//
// Production: "Sign in with Google", and only emails listed in
// STATS_ADMIN_EMAILS are let in. The list is checked again on every page
// load, so removing an email locks that person out right away.
//
// Local development only: a simple email-only login (STATS_DEV_LOGIN=1).
// It is never available in a production build.

import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const devLoginEnabled =
  process.env.NODE_ENV === 'development' && process.env.STATS_DEV_LOGIN === '1';

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export function allowedEmails() {
  return (process.env.STATS_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email) {
  return typeof email === 'string' && allowedEmails().includes(email.trim().toLowerCase());
}

export function isAuthConfigured() {
  return Boolean(process.env.NEXTAUTH_SECRET) && allowedEmails().length > 0 &&
    (googleConfigured || devLoginEnabled);
}

export const loginMethods = { google: googleConfigured, dev: devLoginEnabled };

const providers = [];
if (googleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}
if (devLoginEnabled) {
  providers.push(
    CredentialsProvider({
      id: 'dev-login',
      name: 'Dev login',
      credentials: { email: { label: 'Email', type: 'email' } },
      async authorize(credentials) {
        const email = (credentials?.email || '').trim().toLowerCase();
        return isAllowedEmail(email) ? { id: email, email, name: email } : null;
      },
    })
  );
}

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: '/admin/login', error: '/admin/login' },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === 'google') {
        // Google must have verified the address, and it must be on the list.
        return profile?.email_verified === true && isAllowedEmail(profile?.email);
      }
      if (account?.provider === 'dev-login') return devLoginEnabled && isAllowedEmail(user?.email);
      return false;
    },
  },
};

/** The logged-in owner's session, or null if not logged in / not allowed. */
export async function getAdminSession() {
  if (!isAuthConfigured()) return null;
  const session = await getServerSession(authOptions);
  return session && isAllowedEmail(session.user?.email) ? session : null;
}
