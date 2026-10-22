// utils/stats/cookies.js — settings for the statistics cookies (server only).
//
// STATS_COOKIE_DOMAIN=mautskebeli.ge makes the reader and owner cookies cover
// both mautskebeli.ge and www.mautskebeli.ge, so one browser stays one reader
// whichever address it uses. Unset (preview, local): the cookie belongs to the
// current address only.

import { COOKIE_MAX_AGE_SECONDS } from './config';

export function statsCookieOptions() {
  const domain = process.env.STATS_COOKIE_DOMAIN;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    ...(domain ? { domain } : {}),
  };
}
