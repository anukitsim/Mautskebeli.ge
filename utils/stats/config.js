// utils/stats/config.js — shared settings for article reading statistics.
//
// Server-only values (secrets, database) are read in the other utils/stats
// files. This file holds only plain constants, so it is safe to import from
// client components too.

// A "real read": the tab was visible this long, in one sitting…
export const READ_MIN_SECONDS = 45;
// …and the reader got at least this far through the article text (%).
export const READ_MIN_SCROLL = 25;

// "Today", "this week" etc. are Tbilisi days, not the US server's days.
export const STATS_TIMEZONE = 'Asia/Tbilisi';

export const CONTENT_TYPES = ['article', 'news', 'free-column', 'translate', 'book'];
export const LANGS = ['ka', 'en', 'ru'];

// Cookie that holds the anonymous random browser ID.
export const VISITOR_COOKIE = 'mau_rid';
// Cookie that marks an owner's device, so their own reading isn't counted.
export const STAFF_COOKIE = 'mau_staff';
// Fixed lifetime for both cookies: 13 months (not renewed on each visit).
export const COOKIE_MAX_AGE_SECONDS = 395 * 24 * 60 * 60;

// The page's signed ticket is accepted for this long after the page was made.
export const TICKET_MAX_AGE_SECONDS = 48 * 60 * 60;

// Engaged time is capped, so a tab left open for days can't skew averages.
export const MAX_ENGAGED_SECONDS = 4 * 60 * 60;

export const PERIODS = {
  today: { days: 1, label: 'დღეს' },
  '7d': { days: 7, label: '7 დღე' },
  '30d': { days: 30, label: '30 დღე' },
  all: { days: null, label: 'სულ' },
};
export const DEFAULT_PERIOD = '30d';
