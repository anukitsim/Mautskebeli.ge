import NewsDetailClient from './NewsDetailClient';

const WP_API = 'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2';

async function fetchNewsBySlug(slug) {
  try {
    const res = await fetch(
      `${WP_API}/news?slug=${encodeURIComponent(slug)}&acf_format=standard&_fields=id,title,acf,date,slug`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const newsItem = data[0];

    if (newsItem.acf?.image && typeof newsItem.acf.image === 'number') {
      try {
        const mediaRes = await fetch(`${WP_API}/media/${newsItem.acf.image}`, {
          next: { revalidate: 60 },
        });
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          newsItem.acf.image = mediaData.source_url;
        }
      } catch {}
    }

    return newsItem;
  } catch {
    return null;
  }
}

function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…');
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const news = await fetchNewsBySlug(slug);

  if (!news) {
    return {
      title: 'ახალი ამბავი ვერ მოიძებნა | მაუწყებელი',
      description: 'მოთხოვნილი ამბავი ვერ მოიძებნა.',
    };
  }

  const decodedTitle = decodeEntities(news.title?.rendered || news.title || '');
  const description = decodeEntities(
    stripHtml(news.acf?.description || news.acf?.main_text || '').slice(0, 200)
  );

  let rawImageUrl = '';
  if (news.acf?.image) {
    const img = news.acf.image;
    if (typeof img === 'string' && img.startsWith('http')) {
      rawImageUrl = img.split('?')[0];
    } else if (typeof img === 'object' && img?.url) {
      rawImageUrl = img.url.split('?')[0];
    }
  }

  const imageUrl = rawImageUrl
    ? `https://www.mautskebeli.ge/api/og-image?url=${encodeURIComponent(rawImageUrl)}`
    : 'https://www.mautskebeli.ge/images/og-logo.jpg';

  const metadataBase = new URL('https://www.mautskebeli.ge');
  const canonicalUrl = `/news/${slug}`;

  return {
    metadataBase,
    title: `${decodedTitle} | მაუწყებელი`,
    description,
    openGraph: {
      title: decodedTitle,
      description,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: decodedTitle,
        },
      ],
      locale: 'ka_GE',
      siteName: 'მაუწყებელი',
    },
    twitter: {
      card: 'summary_large_image',
      title: decodedTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default function NewsDetailPage() {
  return <NewsDetailClient />;
}
