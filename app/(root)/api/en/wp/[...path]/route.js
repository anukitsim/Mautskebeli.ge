// /api/en/wp/<wordpress route> — the same WordPress data, in English.
//
// Browser components on English pages call this instead of WordPress
// (LanguageContext redirects their GET requests here). It reads from the
// site's own WordPress only (public read routes), so it can't be used to
// translate arbitrary text, and translations come from / go to the store
// with its monthly limit (utils/translate).

import { NextResponse } from 'next/server';
import { translateWpJson } from '@/utils/translate/wp';

const WP = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://mautskebeli.wpenginepowered.com/wp-json').replace(/\/$/, '');
const ALLOWED = /^(wp\/v2|custom\/v1)\/[\w\-/%.]+$/;
const PASS_HEADERS = ['x-wp-total', 'x-wp-totalpages', 'link'];

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const route = (params.path || []).join('/');
  if (!ALLOWED.test(route)) {
    return NextResponse.json({ error: 'not allowed' }, { status: 404 });
  }

  // Drop cache-busting parameters (?_=timestamp) so WordPress answers can be reused.
  const search = new URLSearchParams(request.nextUrl.searchParams);
  search.delete('_');
  const upstream = `${WP}/${route}${search.toString() ? `?${search}` : ''}`;

  let res;
  try {
    res = await fetch(upstream, { next: { revalidate: 60 } });
  } catch {
    return NextResponse.json({ error: 'WordPress unreachable' }, { status: 502 });
  }

  const headers = { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' };
  for (const h of PASS_HEADERS) {
    const v = res.headers.get(h);
    if (v) headers[h] = v;
  }

  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('json')) {
    return new NextResponse(await res.text(), { status: res.status, headers: { ...headers, 'content-type': type || 'text/plain' } });
  }

  const json = await res.json();
  const { data, complete } = await translateWpJson(json, { deadlineMs: 8000 });
  headers['x-translation-complete'] = String(complete);
  if (!complete) headers['Cache-Control'] = 'no-store'; // don't keep a half-translated answer
  return NextResponse.json(data, { status: res.status, headers });
}
