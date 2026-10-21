// utils/stats/ticket.js — signed "reading tickets" (server only).
//
// When the server builds an article page, it adds a small ticket that says
// "this is article 5089, Georgian, made at 12:03", signed with a secret key.
// /api/reading only accepts signals that carry a real, recent ticket, so
// nobody can send fake counts for an article by hand.

import crypto from 'node:crypto';
import { isStatsDbConfigured } from './db';
import { CONTENT_TYPES, LANGS, TICKET_MAX_AGE_SECONDS } from './config';

function secret() {
  return process.env.STATS_SECRET || '';
}

// Statistics run only when both the database and a strong secret are set.
export function isStatsEnabled() {
  return isStatsDbConfigured() && secret().length >= 32;
}

function sign(body) {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}

/**
 * Returns a ticket string for the page, or null when statistics are off
 * (then the page renders exactly as before, with no tracker).
 */
export function createReadingTicket({ type, postId, lang }) {
  if (!isStatsEnabled()) return null;
  const id = Number(postId);
  if (!CONTENT_TYPES.includes(type) || !LANGS.includes(lang) || !Number.isInteger(id) || id <= 0) {
    return null;
  }
  const body = Buffer.from(
    JSON.stringify({ v: 1, t: type, p: id, l: lang, i: Math.floor(Date.now() / 1000) })
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

/**
 * Checks a ticket. Returns { ok: true, data } or { ok: false, reason }.
 * data = { type, postId, lang, issuedAt }
 */
export function verifyReadingTicket(ticket) {
  if (typeof ticket !== 'string' || ticket.length > 300) return { ok: false, reason: 'bad_ticket' };
  const [body, sig] = ticket.split('.');
  if (!body || !sig) return { ok: false, reason: 'bad_ticket' };

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'bad_ticket' };
  }

  let data;
  try {
    data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'bad_ticket' };
  }
  if (
    data?.v !== 1 ||
    !CONTENT_TYPES.includes(data.t) ||
    !LANGS.includes(data.l) ||
    !Number.isInteger(data.p) ||
    data.p <= 0 ||
    !Number.isInteger(data.i)
  ) {
    return { ok: false, reason: 'bad_ticket' };
  }

  const age = Math.floor(Date.now() / 1000) - data.i;
  if (age > TICKET_MAX_AGE_SECONDS || age < -300) return { ok: false, reason: 'expired' };

  return { ok: true, data: { type: data.t, postId: data.p, lang: data.l, issuedAt: data.i } };
}
