// utils/stats/audience.js — where a visit came from, which device, which country.
//
// Only categories and site names are stored, never a full address, an IP or
// anything about the person. Labels are in Georgian for the dashboard.

export const SOURCE_LABELS = {
  facebook: 'Facebook',
  google: 'Google',
  telegram: 'Telegram',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  email: 'ელფოსტა / ნიუსლეთერი',
  search: 'სხვა საძიებო სისტემა',
  other: 'სხვა საიტი',
  internal: 'საიტის შიგნიდან',
  direct: 'პირდაპირი / მესენჯერი',
  unknown: 'უცნობი (ძველი ჩანაწერი)',
};

export const DEVICE_LABELS = {
  mobile: 'ტელეფონი',
  tablet: 'ტაბლეტი',
  desktop: 'კომპიუტერი',
  unknown: 'უცნობი (ძველი ჩანაწერი)',
};

const BY_HOST = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, 'telegram'],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, 'x'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  // google.com, google.ge, news.google.com, and the Google app on Android
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android/, 'google'],
  [/(^|\.)(bing\.com|yandex\.[a-z.]+|duckduckgo\.com|yahoo\.com|ecosia\.org|baidu\.com)$/, 'search'],
  [/(mail\.|outlook\.|gmail)/, 'email'],
];

const BY_TAG = [
  [/^(facebook|fb|fbads|meta)/, 'facebook'],
  [/^(instagram|ig)/, 'instagram'],
  [/^(telegram|tg)/, 'telegram'],
  [/^(twitter|x)$/, 'x'],
  [/^(youtube|yt)/, 'youtube'],
  [/^google/, 'google'],
  [/(newsletter|email|mail)/, 'email'],
];

const cleanHost = (h) => {
  const host = String(h || '').trim().toLowerCase().replace(/^www\./, '').slice(0, 100);
  return /^[a-z0-9.-]+$/.test(host) ? host : '';
};
const cleanTag = (t) => {
  const tag = String(t || '').trim().toLowerCase().slice(0, 40);
  return /^[a-z0-9._-]+$/.test(tag) ? tag : '';
};

/**
 * src (sent by the browser): { internal, ref, utm, click }
 *   internal – the reader came from another page of our own site
 *   ref      – the referring site's host name (landing page only)
 *   utm      – the utm_source tag of the landing address
 *   click    – 'fb' (fbclid) or 'g' (gclid) in the landing address
 * Returns { source, referrer }.
 */
export function classifySource(src = {}) {
  if (src.internal === true) return { source: 'internal', referrer: null };
  const tag = cleanTag(src.utm);
  const host = cleanHost(src.ref);
  if (tag) {
    const hit = BY_TAG.find(([re]) => re.test(tag));
    return { source: hit ? hit[1] : 'other', referrer: tag };
  }
  if (src.click === 'fb') return { source: 'facebook', referrer: host || null };
  if (src.click === 'g') return { source: 'google', referrer: host || null };
  if (!host) return { source: 'direct', referrer: null };
  const hit = BY_HOST.find(([re]) => re.test(host));
  return { source: hit ? hit[1] : 'other', referrer: host };
}

/** mobile / tablet / desktop from the browser name (+ a touch hint for iPads). */
export function deviceFrom(userAgent = '', touchHint = false) {
  if (/iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(userAgent)) return 'mobile';
  // iPads report themselves as a Mac; a Mac with a touch screen is an iPad.
  if (touchHint === true && /Macintosh/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

/** Two-letter country code from Vercel's header, or null. */
export function countryFrom(headerValue) {
  const c = String(headerValue || '').toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : null;
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['ka'], { type: 'region' });
  } catch {
    return null;
  }
})();

export function countryLabel(code) {
  if (!code || code === 'unknown') return 'უცნობი';
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
}
