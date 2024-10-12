// app/free-column/[id]/page.jsx

import ColumnPage from "./ColumnPage";



export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    // Fetch the article data from WordPress
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,acf,date`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error('Failed to fetch article data');
    }

    const article = await res.json();

    // Function to sanitize and extract text from HTML
    const sanitizeDescription = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    };

    const ogDescription = sanitizeDescription(article.acf['main-text']).slice(0, 150);

    // Use the original image URL from WordPress backend
    const ogImageUrl = article.acf.image || '/images/default-og-image.jpg';

    return {
      title: article.acf.title || 'Default Title',
      description: ogDescription || 'Default description',
      openGraph: {
        title: article.acf.title || 'Default Title',
        description: ogDescription || 'Default description',
        url: `https://www.mautskebeli.ge/free-column/${id}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
      additionalMetaTags: [
        { property: 'fb:app_id', content: '1819807585106457' },
        { property: 'og:site_name', content: 'Mautskebeli' },
        { property: 'og:locale', content: 'ka_GE' },
        { property: 'article:publisher', content: '100041686795244' },
      ],
    };
  } catch (error) {
    console.error('Error generating metadata:', error);

    // Return default metadata in case of error
    return {
      title: 'Default Title',
      description: 'Default description',
      openGraph: {
        title: 'Default Title',
        description: 'Default description',
        url: `https://www.mautskebeli.ge/free-column/${id}`,
        images: [
          {
            url: '/images/og-logo.jpg',
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
    };
  }
}

export default async function Page({ params }) {
  const { id } = params;

  try {
    // Fetch the article data from WordPress
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,acf,date`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error('Failed to fetch article data');
    }

    const article = await res.json();

    // Pass the article data to the client component
    return <ColumnPage article={article} />;
  } catch (error) {
    console.error('Error fetching article data:', error);
    return <div>Error loading article.</div>;
  }
}
