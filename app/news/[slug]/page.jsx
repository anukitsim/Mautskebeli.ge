import { cache } from 'react';
import NewsDetailClient from './NewsDetailClient';
import { getLang } from '@/utils/i18n/server';
import { isMachineTranslationOn, translateContent } from '@/utils/translate';
import ReadingTracker from '../../components/ReadingTracker';
import { createReadingTicket } from '@/utils/stats/ticket';

const WP_API = 'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2';

async function fetchNewsBySlug(slug) {
  try {
    const res = await fetch(
      `${WP_API}/news?slug=${encodeURIComponent(slug)}&acf_format=standard&_fields=id,title,acf,date,slug`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    let newsItem;
    if (data && data.length > 0) {
      newsItem = data[0];
    } else {
      // Not a current slug — it may be a FORMER slug (e.g. a news item
      // whose URL was cleaned up to a Latin slug). Check WordPress's own
      // record of old slugs so metadata still resolves for shared links.
      const resolveRes = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/custom/v1/resolve-article-slug?post_type=news&slug=${encodeURIComponent(slug)}`,
        { next: { revalidate: 60 } }
      );
      if (!resolveRes.ok) return null;
      const resolved = await resolveRes.json();
      if (!resolved.found) return null;
      newsItem = {
        id: resolved.id,
        slug: resolved.slug,
        title: resolved.title,
        date: resolved.date,
        acf: resolved.acf,
      };
    }

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

// English page: the same news item with its texts machine-translated.
// cache(): generateMetadata and the page share one translation per request.
const getEnglishNews = cache(async (slug) => {
  const news = await fetchNewsBySlug(slug);
  if (!news) return { news: null, complete: true };
  const acf = news.acf || {};
  const { text, html, complete } = await translateContent({
    text: {
      title: decodeEntities(news.title?.rendered || news.title || ''),
      description: acf.description,
      author: acf.author,
      tags: acf.tags,
    },
    html: { main_text: acf.main_text },
  });
  return {
    complete,
    news: {
      ...news,
      title: { rendered: text.title },
      acf: { ...acf, description: text.description, author: text.author, tags: text.tags, main_text: html.main_text },
    },
  };
});

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
  const lang = getLang();
  const news = lang === 'en' ? (await getEnglishNews(slug)).news : await fetchNewsBySlug(slug);

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
  const georgianUrl = `/news/${news.slug || slug}`;
  const englishUrl = `/en${georgianUrl}`;
  const canonicalUrl = lang === 'en' ? englishUrl : georgianUrl;
  const siteName = lang === 'en' ? 'Mautskebeli' : 'მაუწყებელი';

  return {
    metadataBase,
    alternates: {
      canonical: canonicalUrl,
      ...(isMachineTranslationOn() && { languages: { ka: georgianUrl, en: englishUrl } }),
    },
    title: `${decodedTitle} | ${siteName}`,
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
      locale: lang === 'en' ? 'en_US' : 'ka_GE',
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: decodedTitle,
      description,
      images: [imageUrl],
    },
  };
}

// The news text itself is loaded in the browser by NewsDetailClient. The
// server only looks the item up here (cached, same request as the metadata)
// to sign the reading-statistics ticket. An old address is skipped: the
// browser is about to jump to the new one, which then counts once.
function sameSlug(a, b) {
  try {
    return decodeURIComponent(a || '') === decodeURIComponent(b || '');
  } catch {
    return a === b;
  }
}

export default async function NewsDetailPage({ params }) {
  const lang = getLang();
  const english = lang === 'en' ? await getEnglishNews(params.slug) : null;
  const news = english ? english.news : await fetchNewsBySlug(params.slug);
  const readingTicket =
    news && sameSlug(news.slug, params.slug)
      ? createReadingTicket({ type: 'news', postId: news.id, lang })
      : null;

  return (
    <>
      <NewsDetailClient
        initialNews={english ? english.news : null}
        translationComplete={english ? english.complete : true}
      />
      <ReadingTracker ticket={readingTicket} contentSelector="[data-reading-body]" />
    </>
  );
}
