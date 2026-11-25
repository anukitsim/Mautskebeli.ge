// utils/i18n/config.js — the site's two interface languages, in one place.
//
// Georgian pages live at their normal address (/news/...).
// English pages live at the same address with /en in front (/en/news/...).
// middleware.js turns /en/... into the normal page plus a header that says
// "English", so the same page files serve both languages.

export const DEFAULT_LANG = 'ka';
export const SITE_LANGS = ['ka', 'en'];

// Request header set by middleware.js, read by server components.
export const LANG_HEADER = 'x-site-lang';

// Cookie that remembers the reader's choice, so a Georgian link opened by
// someone reading in English takes them to the English page.
export const LANG_COOKIE = 'site_lang';

export const EN_PREFIX = '/en';

export function isSiteLang(value) {
  return SITE_LANGS.includes(value);
}
