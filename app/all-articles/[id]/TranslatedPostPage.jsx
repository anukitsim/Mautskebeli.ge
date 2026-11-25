// app/all-articles/[id]/TranslatedPostPage.jsx
//
// The page for one translation of a post (article or free column):
//   /<section>/<slug>/ENG  English      (WordPress fields language1_*)
//   /<section>/<slug>/RU   Russian      (language2_*)
//   /<section>/<slug>/HY   Armenian     (language3_*)
//   /<section>/<slug>/AZ   Azerbaijani  (language4_*)
// Used by app/all-articles/[id]/[lang]/page.jsx and
// app/free-column/[id]/[lang]/page.jsx. Languages: ./translations.js.

import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Noto_Sans_Armenian } from 'next/font/google';
import { decode } from 'html-entities';
import React from 'react';

import DynamicClientComponents from './DynamicClientComponents';
import ArticleLanguageSwitcher from './ArticleLanguageSwitcher';
import { fetchPost } from './fetchArticle';
import { prepareArticleHtml } from './articleContent';
import {
  ORIGINAL,
  findTranslationByPath,
  hasTranslationContent,
  getPublishedTranslations,
  postUrl,
} from './translations';
import { localizePath } from '@/utils/i18n/paths';
import { getLang } from '@/utils/i18n/server';
import { translateUi } from '@/utils/i18n/dictionary';
import ReadingTracker from '../../components/ReadingTracker';
import { createReadingTicket } from '@/utils/stats/ticket';

// The site's Georgian fonts have no Armenian letters. FiraGO covers
// Latin (incl. Azerbaijani ə, ğ, ş…) and Cyrillic; Noto Sans Armenian
// fills in Armenian. Only downloaded by pages that use Armenian text.
const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-sans-armenian',
});

const FONT_STACK =
  'var(--font-firago), var(--font-noto-sans-armenian), var(--font-noto-sans-georgian), sans-serif';

/**
 * postType     WordPress post type ('article', 'free-column')
 * basePath     address of the section ('/all-articles', '/free-column')
 * sectionName  its name in the category bar (highlighted)
 * statsType    content type for reading statistics
 */
export function makeTranslatedPostPage({ postType, basePath, sectionName, statsType }) {
  const categories = [
    { name: 'სტატიები', path: '/all-articles' },
    { name: 'თარგმანი', path: '/translate' },
    { name: 'მაუწყებელი წიგნები', path: '/books' },
    { name: 'თავისუფალი სვეტი', path: '/free-column' },
  ];

  // Everything the page needs, or null → 404.
  async function loadTranslation(id, langPath) {
    const translation = findTranslationByPath(langPath);
    if (!translation) return null;

    const article = await fetchPost(postType, id);
    if (!article || !hasTranslationContent(article.acf, translation)) return null;

    const acf = article.acf;
    const f = translation.field;
    return {
      article,
      translation,
      slug: article.slug || id,
      title: decode(acf[`${f}_title`] || ''),
      subTitle: acf[`${f}_sub_title`] || '',
      author: acf[`${f}_ავტორი`] || '',
      image: acf[`${f}_image`] || acf.image || '/images/default-og-image.jpg',
      pdf: acf[`${f}_pdf`] || '',
      mainText: acf[`${f}_main_text`] || '',
    };
  }

  function formatDate(dateString, code) {
    try {
      // WordPress gives the date without a time zone; read and print it as
      // UTC so the day never shifts.
      return new Intl.DateTimeFormat(code, {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${dateString}Z`));
    } catch {
      return dateString?.slice(0, 10) || '';
    }
  }

  function plainTextExcerpt(html, wordLimit = 30) {
    const words = decode(html.replace(/<[^>]*>/g, ' ')).split(/\s+/).filter(Boolean);
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '…' : '');
  }

  async function generateMetadata({ params }) {
    const data = await loadTranslation(params.id, params.lang);
    if (!data) return {};

    const { article, translation, slug, title, subTitle, image, mainText } = data;
    const description = subTitle || plainTextExcerpt(mainText);
    const url = postUrl(basePath, slug, translation);
    const ogImage = image.split('?')[0];

    // hreflang links: the original + every published translation (+ this one).
    const published = getPublishedTranslations(article.acf);
    const languages = { ka: postUrl(basePath, slug, ORIGINAL) };
    for (const t of [...published, translation]) languages[t.code] = postUrl(basePath, slug, t);

    return {
      metadataBase: new URL('https://www.mautskebeli.ge'),
      title,
      description,
      alternates: { canonical: url, languages },
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        images: [ogImage],
        locale: translation.ogLocale,
        siteName: 'Mautskebeli',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  }

  const TranslatedPostPage = async ({ params }) => {
    const data = await loadTranslation(params.id, params.lang);
    if (!data) notFound();

    const { article, translation, slug, title, subTitle, author, image, pdf, mainText } = data;

    // Old slug or lower-case "/eng" → the current, canonical address.
    if ((article._redirectFrom && article.slug) || params.lang !== translation.path) {
      redirect(postUrl(basePath, slug, translation));
    }

    const content = prepareArticleHtml(mainText);
    const ui = translation.ui;
    const t = (ka) => translateUi(getLang(), ka);

    // Reading statistics. The stats database only accepts ka/en/ru for now,
    // so Armenian/Azerbaijani pages get no ticket (null = no tracker) until
    // utils/stats/config.js LANGS and the DB check in db/stats-schema.sql
    // are extended.
    const readingTicket = createReadingTicket({
      type: statsType,
      postId: article.id,
      lang: translation.code,
    });

    return (
      <section
        lang={translation.code}
        className={`${notoSansArmenian.variable} w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative`}
        style={{ fontFamily: FONT_STACK }}
      >
        <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
          <div
            lang="ka"
            className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]"
          >
            {categories.map((category) => (
              <a
                key={category.name}
                href={localizePath(category.path, getLang())}
                className={`text-sm text-[#474F7A] ${
                  category.name === sectionName
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
              src={image}
              alt={title}
              width={800}
              height={450}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full"
            />
            <ArticleLanguageSwitcher
              slug={slug}
              current={translation}
              published={getPublishedTranslations(article.acf)}
              basePath={basePath}
            />
          </div>

          <h1 className="text-[30px] sm:text-[52px] font-bold leading-[1.1] text-[#474F7A] mt-[24px] mb-5 break-words">
            {title}
          </h1>
          {subTitle && (
            <p className="text-[20px] sm:text-[28px] leading-snug text-[#474F7A] mt-[16px] mb-5">
              {subTitle}
            </p>
          )}
          {author && (
            <p className="text-[16px] sm:text-[22px] font-bold text-[#AD88C6] leading-normal mb-5">
              {author}
            </p>
          )}
          <p className="text-[#474F7A] font-semibold pb-10">
            <time dateTime={article.date}>{formatDate(article.date, translation.code)}</time>
          </p>
          {pdf && (
            <p className="text-[#474F7A] font-semibold pb-10">
              <a href={pdf} target="_blank" rel="noopener noreferrer" download className="underline">
                {ui.pdf}
              </a>
            </p>
          )}

          <div
            className="article-content text-[#474F7A] text-[15px] sm:text-[17px] font-normal lg:text-justify leading-[30px] sm:leading-[34px] mt-5"
            style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>

          <DynamicClientComponents
            id={slug}
            title={title}
            path={postUrl(basePath, slug, translation)}
            ui={ui}
          />
          <ReadingTracker ticket={readingTicket} />
        </div>
        <footer className="h-[100px]"></footer>
      </section>
    );
  };

  return { generateMetadata, Page: TranslatedPostPage };
}
