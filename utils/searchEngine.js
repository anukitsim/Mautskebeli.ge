/**
 * Search engine for mautskebeli.ge
 * Fetches content from WordPress, filters with simple substring matching.
 */

import { decode } from 'html-entities';
import { containsAsWord, highlight, getSnippet, scoreAndMatch } from './searchMatch.js';

const WP_ORIGIN =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'https://mautskebeli.wpenginepowered.com';
const API_BASE = WP_ORIGIN.includes('/wp-json')
  ? WP_ORIGIN
  : `${WP_ORIGIN.replace(/\/$/, '')}/wp-json`;
const WP_V2 = `${API_BASE}/wp/v2`;
const CUSTOM_V1 = `${API_BASE}/custom/v1`;
const DEFAULT_IMAGE = 'https://www.mautskebeli.ge/images/default-og-image.jpg';
const FETCH_TIMEOUT_MS = 15000;
const PER_PAGE = 100;
const MAX_RESULTS = 10;

const AUTHOR_KEYS = ['ავტორი', 'author', 'მთარგმნელი'];

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function dec(val) {
  if (val == null || val === '') return '';
  try { return decode(String(val)); } catch { return String(val); }
}

function getAuthor(acf) {
  if (!acf) return '';
  for (const key of AUTHOR_KEYS) {
    const v = acf[key];
    if (v != null && v !== '') return dec(stripHtml(String(v)));
  }
  return '';
}

function getBody(acf) {
  const raw = acf?.['main-text'] ?? acf?.text ?? acf?.description ?? acf?.content ?? '';
  return stripHtml(raw);
}

async function safeFetch(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 120 } });
    clearTimeout(timeout);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchPaginated(baseUrl, maxPages = 20, extraParams = {}) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(page),
      ...extraParams,
    });
    const data = await safeFetch(`${baseUrl}?${params}`);
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) break;
    all.push(...list);
    if (list.length < PER_PAGE) break;
  }
  return all;
}

function extractYoutubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(
    /(?:youtube\.com\/(?:[^/]+\/|v|e(?:mbed)?)\/|.*[?&]v=|youtu\.be\/)([^"&?/\s]{11})/
  );
  return m ? m[1] : null;
}

async function fetchArticles() {
  return fetchPaginated(`${WP_V2}/article`, 20, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function fetchNews() {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const data = await safeFetch(
      `${CUSTOM_V1}/news?per_page=${PER_PAGE}&page=${page}`
    );
    const list = data?.news ?? (Array.isArray(data) ? data : []);
    if (list.length === 0) break;
    all.push(...list);
    if (list.length < PER_PAGE) break;
  }
  return all;
}

async function fetchTargmani() {
  return fetchPaginated(`${WP_V2}/targmani`, 15, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function fetchFreeColumn() {
  return fetchPaginated(`${WP_V2}/free-column`, 15, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function fetchBooks() {
  return fetchPaginated(`${WP_V2}/mau-books`, 10, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function fetchSportArticles() {
  return fetchPaginated(`${WP_V2}/sport-article`, 10, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function fetchAllVideos() {
  const data = await safeFetch(`${CUSTOM_V1}/all_videos`);
  return Array.isArray(data) ? data : [];
}

async function fetchSportVideos() {
  return fetchPaginated(`${WP_V2}/sporti-videos`, 5, {
    acf_format: 'standard',
    orderby: 'date',
    order: 'desc',
  });
}

async function buildMediaMap(ids) {
  const map = new Map();
  if (ids.size === 0) return map;
  const results = await Promise.all(
    [...ids].map(async (id) => {
      try {
        const res = await fetch(`${WP_V2}/media/${id}?_fields=source_url`, {
          next: { revalidate: 120 },
        });
        if (!res.ok) return { id, url: DEFAULT_IMAGE };
        const data = await res.json();
        return { id, url: data.source_url || DEFAULT_IMAGE };
      } catch {
        return { id, url: DEFAULT_IMAGE };
      }
    })
  );
  results.forEach(({ id, url }) => map.set(id, url));
  return map;
}

function resolveImage(item, mediaMap) {
  const img = item.acf?.image;
  if (typeof img === 'number') return mediaMap.get(img) || DEFAULT_IMAGE;
  if (img?.url)
    return img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`;
  if (typeof img === 'string' && img.startsWith('http')) return img;
  return DEFAULT_IMAGE;
}

/**
 * Build a result object for a text-based item (article, translation, etc).
 * q is the raw query string.
 */
function buildTextResult(item, q, mediaMap, { linkPrefix, type }) {
  const title = dec(item.title?.rendered ?? item.title ?? '');
  const author = type === 'news'
    ? dec(stripHtml(item.acf?.author ?? '')) || getAuthor(item.acf)
    : getAuthor(item.acf);
  const bodyRaw =
    type === 'news'
      ? stripHtml(item.content ?? item.excerpt ?? item.acf?.content ?? '')
      : getBody(item.acf);

  const { score, matchedIn } = scoreAndMatch(
    { title: stripHtml(title), author, content: bodyRaw },
    q
  );
  if (score === 0) return null;

  const hasContentMatch = matchedIn.includes('content');
  const excerpt = hasContentMatch
    ? getSnippet(bodyRaw, q, 200)
    : bodyRaw.slice(0, 160);

  let link;
  if (type === 'news') {
    const slug = item.slug ?? item.id;
    link = `/news/${encodeURIComponent(slug)}`;
  } else if (type === 'article') {
    link = `/all-articles/${item.slug ? encodeURIComponent(item.slug) : item.id}`;
  } else {
    link = `${linkPrefix}/${item.id}`;
  }

  const imageUrl =
    type === 'news'
      ? (() => {
          const raw = item.acf?.image ?? item.image;
          if (typeof raw === 'string' && raw.startsWith('http')) return raw;
          if (raw?.url)
            return raw.url.startsWith('http')
              ? raw.url
              : `${WP_ORIGIN}${raw.url}`;
          return DEFAULT_IMAGE;
        })()
      : resolveImage(item, mediaMap);

  return {
    id: item.id ?? slug,
    title,
    titleHighlighted: highlight(title, q),
    author,
    authorHighlighted: highlight(author, q),
    excerpt,
    excerptHighlighted: highlight(excerpt, q),
    link,
    imageUrl: imageUrl || DEFAULT_IMAGE,
    matchedIn,
    score,
    type,
  };
}

function buildVideoResult(item, q, postType) {
  const videoUrl = item.video_url ?? item.acf?.video_url ?? item.acf?.video ?? '';
  const videoId = extractYoutubeId(videoUrl);
  if (!videoId) return null;
  const title = dec(item.title ?? item.title?.rendered ?? '');
  if (!containsAsWord(stripHtml(title), q)) return null;
  const pt = postType || item.post_type || item.type || 'mecniereba';
  const link =
    pt === 'sporti-videos'
      ? `/all-sport-videos/${item.post_id ?? item.id}`
      : `/${pt}?videoId=${videoId}`;
  return {
    id: item.post_id ?? item.id,
    title,
    titleHighlighted: highlight(title, q),
    videoId,
    postType: pt,
    link,
    matchedIn: ['title'],
    score: 10,
    type: 'video',
  };
}

export async function runSearch(query) {
  const q = (query || '').trim();
  const empty = {
    articles: [],
    news: [],
    videos: [],
    translations: [],
    freeColumns: [],
    books: [],
    sportArticles: [],
    meta: { query: q },
  };
  if (!q || q.length < 2) return empty;

  const [
    articlesRaw,
    newsRaw,
    targmaniRaw,
    freeColumnRaw,
    booksRaw,
    sportArticlesRaw,
    allVideosRaw,
    sportVideosRaw,
  ] = await Promise.all([
    fetchArticles(),
    fetchNews(),
    fetchTargmani(),
    fetchFreeColumn(),
    fetchBooks(),
    fetchSportArticles(),
    fetchAllVideos(),
    fetchSportVideos(),
  ]);

  const imageIds = new Set();
  [articlesRaw, targmaniRaw, freeColumnRaw, booksRaw, sportArticlesRaw].forEach(
    (list) => {
      list.forEach((item) => {
        const img = item.acf?.image;
        if (typeof img === 'number') imageIds.add(img);
      });
    }
  );
  const mediaMap = await buildMediaMap(imageIds);

  const process = (items, linkPrefix, type) =>
    items
      .map((item) => buildTextResult(item, q, mediaMap, { linkPrefix, type }))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

  const articles = process(articlesRaw, '/all-articles', 'article');
  const news = process(newsRaw, '/news', 'news');
  const translations = process(targmaniRaw, '/translate', 'translation');
  const freeColumns = process(freeColumnRaw, '/free-column', 'freeColumn');
  const books = process(booksRaw, '/books', 'book');
  const sportArticles = process(sportArticlesRaw, '/sport-articles', 'sportArticle');

  const seenVideo = new Set();
  const videos = [];
  for (const item of allVideosRaw) {
    const v = buildVideoResult(item, q);
    if (!v) continue;
    const key = v.link;
    if (seenVideo.has(key)) continue;
    seenVideo.add(key);
    videos.push(v);
  }
  for (const item of sportVideosRaw) {
    const v = buildVideoResult(item, q, 'sporti-videos');
    if (!v) continue;
    const key = v.link;
    if (seenVideo.has(key)) continue;
    seenVideo.add(key);
    videos.push(v);
  }

  return {
    articles,
    news,
    videos: videos.slice(0, MAX_RESULTS),
    translations,
    freeColumns,
    books,
    sportArticles,
    meta: { query: q },
  };
}
