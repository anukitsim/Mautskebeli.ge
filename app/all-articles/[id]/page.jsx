// all-articles/[id]/page.jsx

import ArticlePage from './ArticlePage';

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    // Fetch the article data directly from your WordPress backend
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error('Failed to fetch article data');
    }

    const article = await res.json();

    // Function to sanitize and extract text from HTML
    const sanitizeDescription = (html) => {
      const regex = /(<([^>]+)>)/gi;
      return html.replace(regex, '').slice(0, 150);
    };

    const ogDescription = sanitizeDescription(article.acf['main-text']);

    // Ensure the OG image URL uses your main domain
    const ogImageUrl = article.acf.image
      ? article.acf.image.replace('mautskebeli.wpenginepowered.com', 'www.mautskebeli.ge')
      : 'https://www.mautskebeli.ge/images/default-og-image.jpg';

    return {
      title: article.title.rendered || 'Default Title',
      description: ogDescription || 'Default description',
      openGraph: {
        title: article.title.rendered || 'Default Title',
        description: ogDescription || 'Default description',
        url: `https://www.mautskebeli.ge/all-articles/${id}`,
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
        url: `https://www.mautskebeli.ge/all-articles/${id}`,
        images: [
          {
            url: 'https://www.mautskebeli.ge/images/default-og-image.jpg',
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
    };
  }
}

const Page = ({ params }) => {
  return <ArticlePage params={params} />;
};

export default Page;
  