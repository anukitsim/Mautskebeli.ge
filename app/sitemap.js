// app/sitemap.js
// Dynamic sitemap for Google: every page that has its own address.
// (Category videos play inside their category page and have no own address,
// so they can't be listed individually.)

const WP = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const BASE_URL = 'https://www.mautskebeli.ge';

// Fetch every item of one WordPress post type, page by page.
// Stops at the last page WordPress reports, so it never asks for a page
// that doesn't exist.
async function fetchAll(route, fields = 'id,slug,modified') {
  const items = [];
  try {
    for (let page = 1; page <= 50; page++) {
      const response = await fetch(`${WP}/wp/v2/${route}?_fields=${fields}&per_page=100&page=${page}`, {
        next: { revalidate: 3600 }, // cache for 1 hour
      });
      if (!response.ok) {
        console.error(`Sitemap: could not fetch ${route} page ${page} (${response.status})`);
        break;
      }
      items.push(...(await response.json()));
      const totalPages = Number(response.headers.get('x-wp-totalpages') || 1);
      if (page >= totalPages) break;
    }
  } catch (error) {
    console.error(`Sitemap: error fetching ${route}:`, error.message);
  }
  return items;
}

const toRoutes = (items, path, priority = 0.7) =>
  items.map((item) => ({
    url: `${BASE_URL}${path(item)}`,
    lastModified: item.modified ? new Date(item.modified) : new Date(),
    changeFrequency: 'weekly',
    priority,
  }));

export default async function sitemap() {
  // Static pages
  const staticPages = [
    '',                    // Homepage
    '/text',
    '/podcast',
    '/sporti',
    '/about-us',
    '/donation',
    '/live',
    '/all-videos',
    '/all-articles',
    '/news',
    '/all-sport-videos',
    '/sport-articles',
    '/free-column',
    '/translate',
    '/books',
    // Categories
    '/shroma',
    '/mecniereba',
    '/ekonomika',
    '/medicina',
    '/xelovneba',
    '/kalaki',
    '/resursebi',
    '/msoflio',
    '/saxli',
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const [articles, news, freeColumns, translations, books, sportArticles, sportVideos, featuredVideos] =
    await Promise.all([
      fetchAll('article'),
      fetchAll('news'),
      fetchAll('free-column'),
      fetchAll('targmani'),
      fetchAll('mau-books', 'id,modified'),
      fetchAll('sport-article'),
      fetchAll('sporti-videos', 'id,modified'),
      fetchAll('main', 'id,modified'),
    ]);

  // Each address below is the one its page actually answers on.
  return [
    ...staticRoutes,
    ...toRoutes(articles, (a) => `/all-articles/${a.slug || a.id}`),
    ...toRoutes(news, (n) => `/news/${n.slug}`, 0.8),
    ...toRoutes(freeColumns, (c) => `/free-column/${c.slug || c.id}`),
    ...toRoutes(translations, (t) => `/translate/${t.slug || t.id}`),
    ...toRoutes(books, (b) => `/books/${b.id}`),
    ...toRoutes(sportArticles, (s) => `/sport-articles/${s.slug || s.id}`),
    ...toRoutes(sportVideos, (v) => `/all-sport-videos/${v.id}`, 0.6),
    ...toRoutes(featuredVideos, (v) => `/${v.id}`, 0.6),
  ];
}
