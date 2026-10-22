// utils/stats/wordpress.js — titles for the dashboard (server only).
//
// Counting never touches WordPress. The dashboard only asks WordPress for the
// list of items (title, slug, date, author) so it can show names instead of
// numbers. Only light fields are requested, never the text itself.

import { decode } from 'html-entities';
import { CONTENT_TYPES } from './content-types';

/**
 * Returns Map<postId, { id, title, slug, date, author }> for one content type.
 * If WordPress can't be reached, returns an empty Map (the dashboard then
 * shows "#5089" instead of the title, and the numbers are still correct).
 */
export async function fetchContentIndex(type) {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  const config = CONTENT_TYPES[type];
  const index = new Map();
  if (!base || !config) return index;

  const fields = `id,slug,date,title,acf.title,acf.${config.author}`;
  try {
    for (let page = 1; page <= 20; page++) {
      const url = `${base}/wp/v2/${config.wp}?per_page=100&page=${page}&_fields=${encodeURIComponent(fields)}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) break;
      const items = await res.json();
      for (const a of items) {
        index.set(a.id, {
          id: a.id,
          title: decode(a.title?.rendered || a.acf?.title || `#${a.id}`),
          slug: a.slug,
          date: a.date,
          author: decode(a.acf?.[config.author] || '')
            .replace(/^(რეცენზიის ავტორი|ავტორები|ავტორი):\s*/, '')
            .trim(),
        });
      }
      const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
      if (page >= totalPages) break;
    }
  } catch (err) {
    console.error(`[stats] could not load ${type} titles from WordPress:`, err.message);
  }
  return index;
}

export function contentUrl(type, item, lang = 'ka') {
  if (!item || !CONTENT_TYPES[type]) return null;
  return CONTENT_TYPES[type].path(item, lang);
}
