/**
 * Robust search engine for mautskebeli.ge
 * Fetches from the same WordPress endpoints the site uses, then filters in memory.
 * No dependency on WordPress ?search= parameter.
 */

import { decode } from 'html-entities';

const WP_ORIGIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://mautskebeli.wpenginepowered.com';
const API_BASE = WP_ORIGIN.includes('/wp-json') ? WP_ORIGIN : `${WP_ORIGIN.replace(/\/$/, '')}/wp-json`;
const WP_V2 = `${API_BASE}/wp/v2`;
const CUSTOM_V1 = `${API_BASE}/custom/v1`;
const DEFAULT_IMAGE = 'https://www.mautskebeli.ge/images/default-og-image.jpg';
const FETCH_TIMEOUT_MS = 15000;
const PER_PAGE = 100;

const AUTHOR_KEYS = ['ავტორი', 'author', 'მთარგმნელი'];

// ---- Helpers ----
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeText(val) {
  if (val == null || val === '') return '';
  try {
    return decode(String(val));
  } catch {
    return String(val);
  }
}

function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return decodeText(str).replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Returns true if query (or all words in query) appears in the searchable text. */
function textMatches(searchableText, query) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const words = q.split(/\s+/).filter(Boolean);
  const text = normalize(searchableText);
  if (!text) return false;
  if (text.includes(q)) return true;
  if (words.length > 1 && words.every((w) => text.includes(w))) return true;
  if (words.length === 1 && text.includes(words[0])) return true;
  return false;
}

function getAuthor(acf) {
  if (!acf) return '';
  for (const key of AUTHOR_KEYS) {
    const v = acf[key];
    if (v != null && v !== '') return decodeText(String(v));
  }
  return '';
}

function getContent(acf) {
  const raw = acf?.['main-text'] ?? acf?.text ?? acf?.description ?? acf?.content ?? '';
  return stripHtml(raw);
}

/** Fetch with timeout; returns [] or parsed JSON array/object on failure. */
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, next: { revalidate: 60 } });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

/** Paginate until no more results (maxPages). Returns flat array. */
async function fetchPaginated(baseUrl, maxPages = 30, queryParams = {}) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page), ...queryParams });
    const url = `${baseUrl}?${params}`;
    const data = await safeFetch(url);
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) break;
    all.push(...list);
    if (list.length < PER_PAGE) break;
  }
  return all;
}

function extractYoutubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/|v|e(?:mbed)?)\/|.*[?&]v=|youtu\.be\/)([^"&?/\s]{11})/);
  return m ? m[1] : null;
}

// ---- Source: Articles (wp/v2/article) ----
async function fetchArticles() {
  return fetchPaginated(`${WP_V2}/article`, 30, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function articleToResult(item, mediaMap) {
  const slug = item.slug;
  const link = slug ? `/all-articles/${encodeURIComponent(slug)}` : `/all-articles/${item.id}`;
  const img = item.acf?.image;
  let imageUrl = DEFAULT_IMAGE;
  if (typeof img === 'number') imageUrl = mediaMap.get(img) || DEFAULT_IMAGE;
  else if (img?.url) imageUrl = img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`;
  else if (typeof img === 'string' && img.startsWith('http')) imageUrl = img;
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    link,
    imageUrl,
    author: getAuthor(item.acf),
    excerpt: getContent(item.acf).slice(0, 160),
    type: 'article',
  };
}

// ---- Source: News (custom/v1/news) ----
async function fetchNews() {
  const all = [];
  for (let page = 1; page <= 15; page++) {
    const data = await safeFetch(`${CUSTOM_V1}/news?per_page=${PER_PAGE}&page=${page}`);
    const list = data?.news ?? (Array.isArray(data) ? data : []);
    if (list.length === 0) break;
    all.push(...list);
    if (list.length < PER_PAGE) break;
  }
  return all;
}

function newsToResult(item) {
  const slug = item.slug ?? item.id;
  const title = item.title?.rendered ?? item.title ?? '';
  const imageUrl = item.acf?.image ?? item.image;
  const url = typeof imageUrl === 'string' && imageUrl.startsWith('http') ? imageUrl : (imageUrl?.url ? (imageUrl.url.startsWith('http') ? imageUrl.url : `${WP_ORIGIN}${imageUrl.url}`) : DEFAULT_IMAGE);
  return {
    id: item.id ?? slug,
    title: decodeText(title),
    link: `/news/${encodeURIComponent(slug)}`,
    imageUrl: url || DEFAULT_IMAGE,
    author: getAuthor(item.acf) || item.acf?.author || '',
    excerpt: stripHtml(item.content ?? item.excerpt ?? item.acf?.content ?? '').slice(0, 160),
    type: 'news',
  };
}

// ---- Source: Translations (wp/v2/targmani) ----
async function fetchTargmani() {
  return fetchPaginated(`${WP_V2}/targmani`, 20, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function targmaniToResult(item, mediaMap) {
  const link = `/translate/${item.id}`;
  const img = item.acf?.image;
  const imageUrl = typeof img === 'number' ? (mediaMap.get(img) || DEFAULT_IMAGE) : (img?.url ? (img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`) : DEFAULT_IMAGE);
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    link,
    imageUrl: imageUrl || DEFAULT_IMAGE,
    author: getAuthor(item.acf),
    excerpt: getContent(item.acf).slice(0, 160),
    type: 'translation',
  };
}

// ---- Source: Free column (wp/v2/free-column) ----
async function fetchFreeColumn() {
  return fetchPaginated(`${WP_V2}/free-column`, 20, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function freeColumnToResult(item, mediaMap) {
  const link = `/free-column/${item.id}`;
  const img = item.acf?.image;
  const imageUrl = typeof img === 'number' ? (mediaMap.get(img) || DEFAULT_IMAGE) : (img?.url ? (img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`) : DEFAULT_IMAGE);
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    link,
    imageUrl: imageUrl || DEFAULT_IMAGE,
    author: getAuthor(item.acf),
    excerpt: getContent(item.acf).slice(0, 160),
    type: 'freeColumn',
  };
}

// ---- Source: Books (wp/v2/mau-books) ----
async function fetchBooks() {
  return fetchPaginated(`${WP_V2}/mau-books`, 15, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function bookToResult(item, mediaMap) {
  const link = `/books/${item.id}`;
  const img = item.acf?.image;
  const imageUrl = typeof img === 'number' ? (mediaMap.get(img) || DEFAULT_IMAGE) : (img?.url ? (img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`) : DEFAULT_IMAGE);
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    link,
    imageUrl: imageUrl || DEFAULT_IMAGE,
    author: getAuthor(item.acf),
    excerpt: getContent(item.acf).slice(0, 160),
    type: 'book',
  };
}

// ---- Source: Sport articles (wp/v2/sport-article) ----
async function fetchSportArticles() {
  return fetchPaginated(`${WP_V2}/sport-article`, 15, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function sportArticleToResult(item, mediaMap) {
  const link = `/sport-articles/${item.id}`;
  const img = item.acf?.image;
  const imageUrl = typeof img === 'number' ? (mediaMap.get(img) || DEFAULT_IMAGE) : (img?.url ? (img.url.startsWith('http') ? img.url : `${WP_ORIGIN}${img.url}`) : DEFAULT_IMAGE);
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    link,
    imageUrl: imageUrl || DEFAULT_IMAGE,
    author: getAuthor(item.acf),
    excerpt: getContent(item.acf).slice(0, 160),
    type: 'sportArticle',
  };
}

// ---- Source: All videos (custom/v1/all_videos) ----
async function fetchAllVideos() {
  const data = await safeFetch(`${CUSTOM_V1}/all_videos`);
  return Array.isArray(data) ? data : [];
}

function videoToResult(item) {
  const videoUrl = item.video_url ?? item.acf?.video_url ?? '';
  const videoId = extractYoutubeId(videoUrl);
  if (!videoId) return null;
  const postType = item.post_type ?? item.type ?? 'mecniereba';
  const link = postType === 'sporti-videos' ? `/all-sport-videos/${item.post_id ?? item.id}` : `/${postType}?videoId=${videoId}`;
  return {
    id: item.post_id ?? item.id,
    title: decodeText(item.title ?? item.title?.rendered ?? ''),
    videoId,
    postType,
    link,
    type: 'video',
  };
}

// ---- Source: Sport videos (wp/v2/sporti-videos) ----
async function fetchSportVideos() {
  return fetchPaginated(`${WP_V2}/sporti-videos`, 10, { acf_format: 'standard', orderby: 'date', order: 'desc' });
}

function sportVideoToResult(item) {
  const videoUrl = item.acf?.video_url ?? item.acf?.video ?? '';
  const videoId = extractYoutubeId(videoUrl);
  if (!videoId) return null;
  return {
    id: item.id,
    title: decodeText(item.title?.rendered || ''),
    videoId,
    postType: 'sporti-videos',
    link: `/all-sport-videos/${item.id}`,
    type: 'video',
  };
}

/** Returns true if item matches query (title, content, author). */
function itemMatchesText(item, query, options = {}) {
  const { type } = options;
  const title = item.title?.rendered ?? item.title ?? '';
  const author = type === 'news' ? (item.acf?.author ?? getAuthor(item.acf)) : getAuthor(item.acf);
  const content = type === 'news' ? (item.content ?? item.excerpt ?? item.acf?.content ?? '') : getContent(item.acf);
  const searchable = [title, author, content].join(' ');
  return textMatches(searchable, query);
}

function videoMatches(item, query) {
  const title = item.title ?? item.title?.rendered ?? '';
  return textMatches(title, query);
}

// ---- Media batch ----
async function buildMediaMap(ids) {
  const map = new Map();
  if (ids.size === 0) return map;
  const list = [...ids];
  const results = await Promise.all(
    list.map(async (id) => {
      try {
        const res = await fetch(`${WP_V2}/media/${id}?_fields=source_url`, { next: { revalidate: 60 } });
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

// ---- Main search ----
export async function runSearch(query) {
  const q = query.trim();
  if (!q || q.length < 2) {
    return {
      articles: [],
      news: [],
      videos: [],
      translations: [],
      freeColumns: [],
      books: [],
      sportArticles: [],
      meta: { query: q },
    };
  }

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
  [articlesRaw, targmaniRaw, freeColumnRaw, booksRaw, sportArticlesRaw].forEach((list) => {
    list.forEach((item) => {
      const img = item.acf?.image;
      if (typeof img === 'number') imageIds.add(img);
    });
  });
  const mediaMap = await buildMediaMap(imageIds);

  const articles = articlesRaw
    .filter((item) => itemMatchesText(item, q))
    .map((item) => articleToResult(item, mediaMap))
    .filter(Boolean);

  const news = newsRaw
    .filter((item) => itemMatchesText(item, q, { type: 'news' }))
    .map((item) => newsToResult(item))
    .filter(Boolean);

  const translations = targmaniRaw
    .filter((item) => itemMatchesText(item, q))
    .map((item) => targmaniToResult(item, mediaMap))
    .filter(Boolean);

  const freeColumns = freeColumnRaw
    .filter((item) => itemMatchesText(item, q))
    .map((item) => freeColumnToResult(item, mediaMap))
    .filter(Boolean);

  const books = booksRaw
    .filter((item) => itemMatchesText(item, q))
    .map((item) => bookToResult(item, mediaMap))
    .filter(Boolean);

  const sportArticles = sportArticlesRaw
    .filter((item) => itemMatchesText(item, q))
    .map((item) => sportArticleToResult(item, mediaMap))
    .filter(Boolean);

  const videosFromAll = allVideosRaw
    .filter((item) => videoMatches(item, q))
    .map((item) => videoToResult(item))
    .filter(Boolean);

  const videosFromSport = sportVideosRaw
    .filter((item) => videoMatches(item, q))
    .map((item) => sportVideoToResult(item))
    .filter(Boolean);

  const seenVideo = new Set();
  const videos = [];
  [...videosFromAll, ...videosFromSport].forEach((v) => {
    const key = v.link || `${v.postType}-${v.videoId}`;
    if (seenVideo.has(key)) return;
    seenVideo.add(key);
    videos.push(v);
  });

  return {
    articles,
    news,
    videos,
    translations,
    freeColumns,
    books,
    sportArticles,
    meta: { query: q },
  };
}
