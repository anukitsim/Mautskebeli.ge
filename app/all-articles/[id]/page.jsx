import dynamic from 'next/dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;
  console.log(`generateMetadata called with id: ${id}`);

  try {
    const apiUrl = `https://www.mautskebeli.ge/api/og-tags?id=${id}`;
    console.log(`Fetching OG tags from: ${apiUrl}`);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      console.error(`Error fetching OG tags: ${res.statusText}`);
      return {
        title: 'Default Title',
        description: 'Default description',
        openGraph: {
          title: 'Default Title',
          description: 'Default description',
          url: `https://www.mautskebeli.ge/all-articles/${id}`,
          images: [
            {
              url: '/images/default-og-image.jpg',
              width: 1200,
              height: 630,
            },
          ],
          type: 'article',
        },
        additionalMetaTags: [{ property: 'fb:app_id', content: '1819807585106457' }],
      };
    }

    const ogTags = await res.json();
    console.log('OG Tags fetched successfully:', ogTags);

    const metadata = {
      title: ogTags.title,
      description: ogTags.description,
      openGraph: {
        title: ogTags.title,
        description: ogTags.description,
        url: ogTags.url,
        images: [
          {
            url: ogTags.image,
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
      additionalMetaTags: [{ property: 'fb:app_id', content: '1819807585106457' }],
    };

    console.log('Returning metadata:', metadata);
    return metadata;

  } catch (error) {
    console.error('Unexpected error fetching metadata:', error);
    return {
      title: 'Default Title',
      description: 'Default description',
      openGraph: {
        title: 'Default Title',
        description: 'Default description',
        url: `https://www.mautskebeli.ge/all-articles/${id}`,
        images: [
          {
            url: '/images/default-og-image.jpg',
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
      additionalMetaTags: [{ property: 'fb:app_id', content: '1819807585106457' }],
    };
  }
}

const ArticlePage = dynamic(() => import('./ArticlePage'), { ssr: false });

const Page = ({ params }) => {
  console.log('Rendering Page component with params:', params);
  return <ArticlePage params={params} />;
};

export default Page;