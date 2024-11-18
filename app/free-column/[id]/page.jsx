// app/free-column/[id]/page.jsx

import ColumnPage from "./ColumnPage"; // Corrected import statement

export async function generateMetadata({ params }) {
  const { id } = params;
  const timestamp = new Date().getTime(); // Add a timestamp to bypass cache

  try {
    // Fetch the article data from WordPress
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,acf,date&_t=${timestamp}`;
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch article data');
    }

    const article = await res.json();

    const sanitizeDescription = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    };

    const ogDescription = sanitizeDescription(article.acf['main-text']).slice(0, 150);
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
    };
  } catch (error) {
    console.error('Error generating metadata:', error);

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
  const timestamp = new Date().getTime(); // Add a timestamp to bypass cache

  try {
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,acf,date&_t=${timestamp}`;
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch article data');
    }

    const article = await res.json();

    return <ColumnPage article={article} />;
  } catch (error) {
    console.error('Error fetching article data:', error);
    return <div>Error loading article.</div>;
  }
}
