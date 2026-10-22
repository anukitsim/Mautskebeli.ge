// app/admin/_lib/format.js — number, date and duration formatting for the dashboard.

import { DEFAULT_PERIOD, PERIODS } from '@/utils/stats/config';

const numberFmt = new Intl.NumberFormat('ka-GE');
const dateFmt = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Tbilisi',
});
const shortDateFmt = new Intl.DateTimeFormat('ka-GE', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const fmtNumber = (n) => numberFmt.format(n || 0);
export const fmtDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : '');
// "2026-10-21" (a Tbilisi calendar day) → "21 ოქტ."
export const fmtDay = (day) => shortDateFmt.format(new Date(`${day}T00:00:00Z`));

export function fmtDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  if (s < 60) return `${s} წმ`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m} წთ ${rest} წმ` : `${m} წთ`;
}

export function fmtPercent(part, whole) {
  if (!whole) return '—';
  return `${Math.round((part / whole) * 100)}%`;
}

export function readPeriod(searchParams) {
  const key = searchParams?.period;
  return PERIODS[key] ? key : DEFAULT_PERIOD;
}

export const LANG_LABELS = { ka: 'ქართული', en: 'English', ru: 'Русский' };
