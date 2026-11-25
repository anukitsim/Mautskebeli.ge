// /api/en/warm — translate the newest posts ahead of time, so English
// readers never wait. Run daily by Vercel Cron (vercel.json); can also be
// called by hand with ?type=article&page=3 to work through the archive.
//
// Safe to run often: paragraphs translated before cost nothing, and the
// monthly character limit in utils/translate still applies.

import { NextResponse } from 'next/server';
import { translateWpJson } from '@/utils/translate/wp';
import { isMachineTranslationOn } from '@/utils/translate';
import { usageThisMonth } from '@/utils/translate/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const WP = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://mautskebeli.wpenginepowered.com/wp-json').replace(/\/$/, '');
// Text sections first (most words), then video sections (titles + descriptions).
const TYPES = ['news', 'article', 'free-column', 'targmani', 'msoflio', 'shroma', 'kalaki', 'mecniereba', 'medicina', 'ekonomika', 'xelovneba', 'resursebi', 'saxli', 'mau-books'];
const TIME_LIMIT_MS = 50_000;

export async function GET(request) {
  // With CRON_SECRET set in Vercel, only Vercel Cron (or someone with the
  // secret) can start a run.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isMachineTranslationOn()) {
    return NextResponse.json({ error: 'machine translation is not configured' }, { status: 503 });
  }

  const params = request.nextUrl.searchParams;
  const types = params.get('type') ? [params.get('type')].filter((t) => TYPES.includes(t)) : TYPES;
  const count = Math.min(Number(params.get('count') || 5), 20);
  const page = Math.max(Number(params.get('page') || 1), 1);
  const started = Date.now();
  const done = [];
  let incomplete = 0;
  let stoppedEarly = false;

  outer: for (const type of types) {
    const list = await fetch(`${WP}/wp/v2/${type}?per_page=${count}&page=${page}&_fields=id`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    for (const { id } of Array.isArray(list) ? list : []) {
      if (Date.now() - started > TIME_LIMIT_MS) { stoppedEarly = true; break outer; }
      const post = await fetch(`${WP}/wp/v2/${type}/${id}?acf_format=standard`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (!post) continue;
      const left = TIME_LIMIT_MS - (Date.now() - started);
      const { complete } = await translateWpJson(post, { single: true, deadlineMs: Math.max(1_000, left) });
      if (!complete) incomplete++;
      done.push(`${type}/${id}`);
    }
  }

  const used = await usageThisMonth().catch(() => null);
  return NextResponse.json({
    translated: done.length,
    incomplete,
    stoppedEarly,
    seconds: Math.round((Date.now() - started) / 1000),
    charactersUsedThisMonth: used,
    monthlyLimit: Number(process.env.MT_MONTHLY_CHAR_LIMIT || 1_900_000),
  });
}
