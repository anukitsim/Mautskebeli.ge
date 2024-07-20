import dynamic from 'next/dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const apiUrl = `https://www.mautskebeli.ge/api/sport-og?id=${id}`;
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
          url: `https://www.mautskebeli.ge/sport-articles/${id}`,
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
    console.log('OG Tags:', ogTags);

    return {
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
    };
  } catch (error) {
    console.error('Unexpected error fetching metadata:', error);
    return {
      title: 'Default Title',
      description: 'Default description',
      openGraph: {
        title: 'Default Title',
        description: 'Default description',
        url: `https://www.mautskebeli.ge/sport-articles/${id}`,
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


const NoSSRArticlePage = dynamic(() => import('./SportArticlePage'), { ssr: false });

const Page = ({ params }) => {
  return <NoSSRArticlePage params={params} />;
};

export default Page;
