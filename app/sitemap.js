// app/sitemap.js
// Dynamic sitemap for Google Search Console

// Fetch all articles from WordPress
async function fetchAllArticles() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article?_fields=slug,modified&per_page=100`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error('Failed to fetch articles for sitemap');
      return [];
    }

    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    return [];
  }
}

// Fetch all books from WordPress
async function fetchAllBooks() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/mau-books?_fields=slug,modified&per_page=100`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return [];
    }

    const books = await response.json();
    return books;
  } catch (error) {
    console.error('Error fetching books for sitemap:', error);
    return [];
  }
}

// Fetch all translations
async function fetchAllTranslations() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/translate?_fields=id,modified&per_page=100`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return [];
    }

    const translations = await response.json();
    return translations;
  } catch (error) {
    console.error('Error fetching translations for sitemap:', error);
    return [];
  }
}

export default async function sitemap() {
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
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic content
  const [articles, books, translations] = await Promise.all([
    fetchAllArticles(),
    fetchAllBooks(),
    fetchAllTranslations(),
  ]);

  // Create article routes with slugs
  const articleRoutes = articles.map((article) => ({
    url: `${baseUrl}/all-articles/${article.slug}`,
    lastModified: new Date(article.modified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Create book routes
  const bookRoutes = books.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: new Date(book.modified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Create translation routes (use ID since they might not have slugs)
  const translationRoutes = translations.map((translation) => ({
    url: `${baseUrl}/translate/${translation.id}`,
    lastModified: new Date(translation.modified),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...articleRoutes,
    ...bookRoutes,
    ...translationRoutes,
  ];
}

