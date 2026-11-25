// all-articles/[id]/page.jsx

import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import React from 'react';

import DynamicClientComponents from './DynamicClientComponents';
import { fetchArticle } from './fetchArticle';
import { prepareArticleHtml } from './articleContent';
import ArticleLanguageSwitcher from './ArticleLanguageSwitcher';
import { ORIGINAL, getPublishedTranslations, articleUrl } from './translations';
import ReadingTracker from '../../components/ReadingTracker';
import { createReadingTicket } from '@/utils/stats/ticket';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'This article does not exist.',
    };
  }

  // Admins edit the "title" field in the article's meta box as the real
  // editorial title; the native WP title (top of the editor) is a
  // separate field that's easy to forget to keep in sync. Prefer the ACF
  // field so the site shows whatever the admin actually intended.
  const decodedTitle = decode(article.acf.title || article.title.rendered || '');
  const description = article.acf.description || article.acf.sub_title || '';
  const decodedDescription = decode(description);

  let imageUrl = article.acf.image
    ? article.acf.image.startsWith('http')
      ? article.acf.image
      : `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${article.acf.image}`
    : 'https://www.mautskebeli.ge/images/default-og-image.jpg';

  imageUrl = imageUrl.split('?')[0];

  const metadataBase = new URL('https://www.mautskebeli.ge');

  // Use slug for canonical URL if available, fallback to ID
  const canonicalPath = article.slug ? `/all-articles/${article.slug}` : `/all-articles/${id}`;

  // Tell search engines about the translated versions of this article.
  const published = getPublishedTranslations(article.acf);
  const languages = published.length
    ? {
        ka: canonicalPath,
        ...Object.fromEntries(
          published.map((t) => [t.code, articleUrl(article.slug || id, t)])
        ),
      }
    : undefined;

  return {
    metadataBase,
    title: decodedTitle,
    description: decodedDescription,
    alternates: { canonical: canonicalPath, ...(languages && { languages }) },
    openGraph: {
      title: decodedTitle,
      description: decodedDescription,
      url: canonicalPath,
      type: 'article',
      images: [imageUrl],
      locale: 'ka_GE',
      siteName: 'Mautskebeli',
    },
    twitter: {
      card: 'summary_large_image',
      title: decodedTitle,
      description: decodedDescription,
      images: [imageUrl],
    },
  };
}

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

function decodeHTMLEntities(str) {
  return decode(str);
}

const ArticlePage = async ({ params }) => {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    notFound();
  }

  // This URL used a FORMER slug (e.g. shared before the URL was cleaned
  // up) — send visitors to the current canonical URL instead of rendering
  // under the stale one.
  if (article._redirectFrom && article.slug) {
    redirect(`/all-articles/${article.slug}`);
  }

  article.formattedDate = formatDate(article.date);
  article.title.rendered = decodeHTMLEntities(article.acf.title || article.title.rendered);

  const sanitizedContent = prepareArticleHtml(article.acf['main-text']);

  /* ─────────────────── translations ─────────────────── */
  const publishedTranslations = getPublishedTranslations(article.acf);
  const urlSlug = article.slug || id;

  // Reading statistics: null (no tracker) unless statistics are switched on.
  const readingTicket = createReadingTicket({ type: 'article', postId: article.id, lang: 'ka' });

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.path}
              className={`text-sm text-[#474F7A] ${
                category.name === 'სტატიები'
                  ? 'text-white font-bold'
                  : 'text-[#474F7A] hover:scale-110'
              }`}
            >
              {category.name}
            </a>
          ))}
        </div>

        <div className="w-full h-auto mb-5">
          <Image
            src={article.acf.image || '/images/default-og-image.jpg'}
            alt={article.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
          <ArticleLanguageSwitcher
            slug={urlSlug}
            current={ORIGINAL}
            published={publishedTranslations}
          />
        </div>

        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {article.title.rendered}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {article.acf.sub_title}
        </h3>
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
          {article.acf['ავტორი']}
        </h2>
        <p className="text-[#474F7A] font-semibold pb-10">
          {article.formattedDate}
        </p>
        {article.acf.full_article_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            იხილეთ სტატიის{' '}
            <a
              href={article.acf.full_article_pdf}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="underline"
            >
              პდფ ვერსია
            </a>
          </p>
        )}

        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        <DynamicClientComponents id={id} title={article.title.rendered} />
        <ReadingTracker ticket={readingTicket} />
      </div>
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ArticlePage;
