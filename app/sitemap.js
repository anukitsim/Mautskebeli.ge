// app/sitemap.js
// Dynamic sitemap for Google Search Console

export default function sitemap() {
  const baseUrl = 'https://www.mautskebeli.ge';
  
  // Static pages
  const staticPages = [
    '',                    // Homepage
    '/text',
    '/podcast',
    '/sporti',
    '/about-us',
    '/donation',
    '/live',
    '/search',
    '/all-videos',
    '/all-articles',
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
    // Facebook posts
    '/facebook-post/1',
    '/facebook-post/2',
    '/facebook-post/3',
    '/facebook-post/4',
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8, // Homepage has highest priority
  }));

  return staticRoutes;
}

