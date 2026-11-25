// middleware.js — English version of the site.
//
//   /en/news/x  → serves the normal /news/x page, with the request header
//                 x-site-lang: en, so pages render in English.
//   /news/x     → Georgian, unless this reader chose English (cookie): then
//                 they are sent to /en/news/x. Links inside the site can stay
//                 plain Georgian addresses and English readers stay in English.
//
// The x-site-lang header is always set here (never trusted from the browser).

import { NextResponse } from 'next/server';
import { LANG_COOKIE, LANG_HEADER } from './utils/i18n/config';
import { hasEnPrefix, localizePath, stripLangPrefix } from './utils/i18n/paths';

function withLang(request, lang) {
  const headers = new Headers(request.headers);
  headers.set(LANG_HEADER, lang);
  return headers;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const chosen = request.cookies.get(LANG_COOKIE)?.value;

  // ?lang=ka / ?lang=en on any link: switch language, then show the clean
  // address. Lets server-made links (e.g. "ქართული" on an English page)
  // reach the other language even though the reader's choice redirects.
  const forced = request.nextUrl.searchParams.get('lang');
  if (forced === 'ka' || forced === 'en') {
    const url = request.nextUrl.clone();
    url.searchParams.delete('lang');
    url.pathname = localizePath(pathname, forced);
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(LANG_COOKIE, forced, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  if (hasEnPrefix(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripLangPrefix(pathname);
    const response = NextResponse.rewrite(url, {
      request: { headers: withLang(request, 'en') },
    });
    // Someone arriving on an English page keeps reading in English while
    // they click around (session cookie). The ENG/GEO buttons set a
    // longer-lived choice themselves.
    if (!chosen) {
      response.cookies.set(LANG_COOKIE, 'en', { path: '/', sameSite: 'lax' });
    }
    return response;
  }

  if (chosen === 'en') {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, 'en');
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next({ request: { headers: withLang(request, 'ka') } });
}

export const config = {
  // Pages only: not Next internals, API routes, the owners' dashboard,
  // or files such as /images/logo.png, /robots.txt, /sitemap.xml.
  matcher: ['/((?!_next/|api/|admin|.*\\.[A-Za-z0-9]+$).*)'],
};
