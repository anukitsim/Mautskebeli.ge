// utils/stats/wordpress.js — article titles for the dashboard (server only).
//
// Counting never touches WordPress. The dashboard only asks WordPress for the
// list of articles (title, slug, date, author) so it can show names instead
// of numbers. Only light fields are requested, never the article text.

import { decode } from 'html-entities';

const AUTHOR_FIELD = 'ავტორი';
const FIELDS = `id,slug,date,title,acf.title,acf.${AUTHOR_FIELD}`;

/**
 * Returns Map<postId, { id, title, slug, date, author }> for all articles.
 * If WordPress can't be reached, returns an empty Map (the dashboard then
 * shows "#5089" instead of the title, and the numbers are still correct).
 */
export async function fetchArticleIndex() {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  const index = new Map();
  if (!base) return index;

  try {
    for (let page = 1; page <= 20; page++) {
      const url = `${base}/wp/v2/article?per_page=100&page=${page}&_fields=${encodeURIComponent(FIELDS)}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) break;
      const items = await res.json();
      for (const a of items) {
        index.set(a.id, {
          id: a.id,
          title: decode(a.title?.rendered || a.acf?.title || `#${a.id}`),
          slug: a.slug,
          date: a.date,
          author: decode(a.acf?.[AUTHOR_FIELD] || '').replace(/^ავტორი:\s*/, ''),
        });
      }
      const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
      if (page >= totalPages) break;
    }
  } catch (err) {
    console.error('[stats] could not load article titles from WordPress:', err.message);
  }
  return index;
}

export function articleUrl(article, lang = 'ka') {
  if (!article) return null;
  const base = `/all-articles/${article.slug || article.id}`;
  return lang === 'en' ? `${base}/ENG` : lang === 'ru' ? `${base}/RU` : base;
}
