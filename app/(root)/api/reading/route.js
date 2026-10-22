// app/(root)/api/reading/route.js — receives reading signals from article pages.
//
// The browser sends: { ticket, openId, seconds, scroll }
//   ticket  – signed by our server when it built the page (which article, language)
//   openId  – random ID the browser made for this one open of the page
//   seconds – how long the tab has been visible so far
//   scroll  – how far through the article text the reader got (%)
//
// Checks, in order: statistics switched on → not flooding → request origin and
// size → not a bot → ticket real and recent → not an owner's device.
// Then one row per open is created or updated (never duplicated).
// Always answers 204 with no body, so the page never waits or breaks.

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { isbot } from 'isbot';
import { statsQuery } from '@/utils/stats/db';
import { isStatsEnabled, verifyReadingTicket } from '@/utils/stats/ticket';
import { statsCookieOptions } from '@/utils/stats/cookies';
import {
  MAX_ENGAGED_SECONDS,
  STAFF_COOKIE,
  STATS_TIMEZONE,
  VISITOR_COOKIE,
} from '@/utils/stats/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 2048;

// Simple per-server-instance flood guard: at most 60 signals per minute per IP.
// The IP is only kept in memory for this minute, never stored.
const RATE_LIMIT = 60;
const rateWindow = { minute: 0, counts: new Map() };

function rateLimited(ip) {
  const minute = Math.floor(Date.now() / 60_000);
  if (rateWindow.minute !== minute) {
    rateWindow.minute = minute;
    rateWindow.counts.clear();
  }
  const n = (rateWindow.counts.get(ip) || 0) + 1;
  rateWindow.counts.set(ip, n);
  // Report "first time over the limit" separately, so a flood costs one log row, not thousands.
  return n > RATE_LIMIT ? (n === RATE_LIMIT + 1 ? 'first' : 'again') : null;
}

function noContent() {
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

async function reject(reason) {
  try {
    await statsQuery(
      `INSERT INTO stats_rejections (day, reason, n)
       VALUES ((now() AT TIME ZONE '${STATS_TIMEZONE}')::date, $1, 1)
       ON CONFLICT (day, reason) DO UPDATE SET n = stats_rejections.n + 1`,
      [reason]
    );
  } catch (err) {
    console.error('[stats] could not record rejection:', err.message);
  }
  return noContent();
}

function clampInt(value, min, max) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export async function POST(request) {
  if (!isStatsEnabled()) return noContent();

  // Flood guard first, so junk floods can't cause a database write each.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimited(ip);
  if (limited === 'first') return reject('rate_limited');
  if (limited === 'again') return noContent();

  // Only our own pages may send signals (blocks other sites using visitors' browsers).
  const origin = request.headers.get('origin');
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {}
    const ownHosts = [request.headers.get('x-forwarded-host'), request.headers.get('host')];
    if (!ownHosts.includes(originHost)) return reject('bad_request');
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reject('bad_request');
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return reject('bad_request');
  }
  if (!body || typeof body.openId !== 'string' || !UUID_RE.test(body.openId)) {
    return reject('bad_request');
  }

  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || isbot(userAgent)) return reject('bot');

  const ticket = verifyReadingTicket(body.ticket);
  if (!ticket.ok) return reject(ticket.reason);

  if (request.cookies.get(STAFF_COOKIE)?.value === '1') return reject('staff');

  // Anonymous browser ID: reuse the cookie if valid, otherwise propose a new one.
  const cookieVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const hasValidCookie = Boolean(cookieVisitor && UUID_RE.test(cookieVisitor));
  const visitorId = hasValidCookie ? cookieVisitor : crypto.randomUUID();

  // Nobody can claim more reading time than has passed since the page was made.
  const secondsSinceTicket = Math.floor(Date.now() / 1000) - ticket.data.issuedAt + 5;
  const seconds = clampInt(body.seconds, 0, Math.min(MAX_ENGAGED_SECONDS, Math.max(0, secondsSinceTicket)));
  const scroll = clampInt(body.scroll, 0, 100);

  let rows;
  try {
    rows = await statsQuery(
      `INSERT INTO stats_opens (open_id, content_type, post_id, lang, visitor_id, engaged_seconds, max_scroll)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (open_id) DO UPDATE SET
         last_seen_at    = now(),
         -- Highest value wins, but never more time than has passed since this open began.
         engaged_seconds = GREATEST(stats_opens.engaged_seconds,
                             LEAST(EXCLUDED.engaged_seconds,
                                   (extract(epoch FROM now() - stats_opens.opened_at))::int + 5)),
         max_scroll      = GREATEST(stats_opens.max_scroll, EXCLUDED.max_scroll)
       WHERE stats_opens.post_id = EXCLUDED.post_id
         AND stats_opens.content_type = EXCLUDED.content_type
         AND stats_opens.lang = EXCLUDED.lang
       RETURNING visitor_id`,
      [body.openId, ticket.data.type, ticket.data.postId, ticket.data.lang, visitorId, seconds, scroll]
    );
  } catch (err) {
    console.error('[stats] could not save reading signal:', err.message);
    return noContent();
  }
  // An openId reused for a different article: refuse it.
  if (rows.length === 0) return reject('mismatch');

  const response = noContent();
  if (!hasValidCookie) {
    // Give the browser the ID actually stored for this open. If two first
    // signals raced each other before the cookie existed, both get the same ID.
    response.cookies.set(VISITOR_COOKIE, rows[0].visitor_id, statsCookieOptions());
  }
  return response;
}
