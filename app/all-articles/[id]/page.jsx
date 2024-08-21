import dynamic from 'next/dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const apiUrl = `https://www.mautskebeli.ge/api/og-tags?id=${id}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
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
      };
    }

    const ogTags = await res.json();

    const metadata = {
      title: ogTags.title || 'Default Title',
      description: ogTags.description || 'Default description',
      openGraph: {
        title: ogTags.title || 'Default Title',
        description: ogTags.description || 'Default description',
        url: ogTags.url || `https://www.mautskebeli.ge/all-articles/${id}`,
        images: [
          {
            url: ogTags.image || '/images/default-og-image.jpg',
            width: 1200,
            height: 630,
          },
        ],
        type: 'article',
      },
    };

    return metadata;

  } catch (error) {
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
    };
  }
}


const ArticlePage = dynamic(() => import('./ArticlePage'), { ssr: false });

const Page = ({ params }) => {
  console.log('Rendering Page component with params:', params);
  return <ArticlePage params={params} />;
};

export default Page;
