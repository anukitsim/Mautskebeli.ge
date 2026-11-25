// all-articles/[id]/page.jsx

import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import React, { cache } from 'react';

import DynamicClientComponents from './DynamicClientComponents';
import { fetchArticle } from './fetchArticle';
import { prepareArticleHtml } from './articleContent';
import ArticleLanguageSwitcher from './ArticleLanguageSwitcher';
import { ORIGINAL, TRANSLATIONS, getPublishedTranslations, articleUrl } from './translations';
import ReadingTracker from '../../components/ReadingTracker';
import { createReadingTicket } from '@/utils/stats/ticket';
import { getLang } from '@/utils/i18n/server';
import { translateUi } from '@/utils/i18n/dictionary';
import { localizePath } from '@/utils/i18n/paths';
import { isMachineTranslationOn, translateContent } from '@/utils/translate';
import MachineTranslationNote from '../../components/MachineTranslationNote';

// English site (/en/all-articles/...): an article with a hand-made English
// translation (language1) shows that one; otherwise its texts are machine-
// translated. cache(): metadata and page share one translation per request.
const getEnglishArticle = cache(async (id) => {
  const article = await fetchArticle(id);
  if (!article) return null;
  const human = getPublishedTranslations(article.acf).find((t) => t.code === 'en') || null;
  if (human) return { article, human, complete: true };
  const acf = article.acf || {};
  const { text, html, complete } = await translateContent({
    text: {
      title: decode(acf.title || article.title?.rendered || ''),
      sub_title: acf.sub_title,
      author: acf['ავტორი'],
      description: acf.description,
    },
    html: { main: acf['main-text'] },
  });
  return {
    human: null,
    complete,
    article: {
      ...article,
      title: { rendered: text.title },
      acf: { ...acf, title: text.title, sub_title: text.sub_title, ['ავტორი']: text.author, description: text.description, ['main-text']: html.main },
    },
  };
});

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

export async function generateMetadata({ params }) {
  const { id } = params;
  const lang = getLang();
  const english = lang === 'en' ? await getEnglishArticle(id) : null;
  const article = english ? english.article : await fetchArticle(id);

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
  const georgianPath = article.slug ? `/all-articles/${article.slug}` : `/all-articles/${id}`;
  const canonicalPath = lang === 'en' ? localizePath(georgianPath, 'en') : georgianPath;

  // Tell search engines about the translated versions of this article.
  const published = getPublishedTranslations(article.acf);
  const machineEnglish = isMachineTranslationOn() && !published.some((t) => t.code === 'en');
  const languages = published.length || machineEnglish
    ? {
        ka: georgianPath,
        ...(machineEnglish && { en: localizePath(georgianPath, 'en') }),
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
      locale: lang === 'en' ? 'en_US' : 'ka_GE',
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

function formatDate(dateString, lang = 'ka') {
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${dateString}Z`));
  }
  moment.locale('ka');
  return moment(dateString).format('LL');
}

function decodeHTMLEntities(str) {
  return decode(str);
}

const ArticlePage = async ({ params }) => {
  const { id } = params;
  const lang = getLang();
  const t = (ka) => translateUi(lang, ka);
  const english = lang === 'en' ? await getEnglishArticle(id) : null;
  // Hand-made English exists: show that page instead of a machine translation.
  if (english?.human) {
    redirect(localizePath(articleUrl(english.article.slug || id, english.human), 'en'));
  }
  const article = english ? english.article : await fetchArticle(id);

  if (!article) {
    notFound();
  }

  // This URL used a FORMER slug (e.g. shared before the URL was cleaned
  // up) — send visitors to the current canonical URL instead of rendering
  // under the stale one.
  if (article._redirectFrom && article.slug) {
    redirect(localizePath(`/all-articles/${article.slug}`, lang));
  }

  const formattedDate = formatDate(article.date, lang);
  const title = english ? article.title.rendered : decodeHTMLEntities(article.acf.title || article.title.rendered);

  const sanitizedContent = prepareArticleHtml(article.acf['main-text']);

  /* ─────────────────── translations ─────────────────── */
  const publishedTranslations = getPublishedTranslations(article.acf);
  const urlSlug = article.slug || id;

  // Reading statistics: null (no tracker) unless statistics are switched on.
  const readingTicket = createReadingTicket({ type: 'article', postId: article.id, lang });

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={localizePath(category.path, lang)}
              className={`text-sm text-[#474F7A] ${
                category.name === 'სტატიები'
                  ? 'text-white font-bold'
                  : 'text-[#474F7A] hover:scale-110'
              }`}
            >
              {t(category.name)}
            </a>
          ))}
        </div>

        <div className="w-full h-auto mb-5">
          <Image
            src={article.acf.image || '/images/default-og-image.jpg'}
            alt={title}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
          {english ? (
            <MachineTranslationNote complete={english.complete} />
          ) : (
            <ArticleLanguageSwitcher
              slug={urlSlug}
              current={ORIGINAL}
              published={publishedTranslations}
            />
          )}
        </div>

        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {title}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {article.acf.sub_title}
        </h3>
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
          {article.acf['ავტორი']}
        </h2>
        <p className="text-[#474F7A] font-semibold pb-10">
          {formattedDate}
        </p>
        {article.acf.full_article_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            {lang === 'en' ? null : <>იხილეთ სტატიის{' '}</>}
            <a
              href={article.acf.full_article_pdf}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="underline"
            >
              {lang === 'en' ? t('იხილეთ სტატიის პდფ ვერსია') : 'პდფ ვერსია'}
            </a>
          </p>
        )}

        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        <DynamicClientComponents
          id={id}
          title={title}
          {...(english && {
            path: localizePath(articleUrl(urlSlug, ORIGINAL), 'en'),
            ui: TRANSLATIONS.find((tr) => tr.code === 'en').ui,
          })}
        />
        <ReadingTracker ticket={readingTicket} />
      </div>
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ArticlePage;
