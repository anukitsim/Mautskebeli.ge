import { getLang } from "@/utils/i18n/server";
import { englishIfNeeded } from '@/utils/translate/server';
import MachineTranslationNote from '@/app/components/MachineTranslationNote';
import { translateUi } from "@/utils/i18n/dictionary";
import { localizePath } from "@/utils/i18n/paths";
// app/free-column/[id]/page.jsx

import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import React from 'react';

// Import the Client Component handling dynamic imports
import DynamicClientComponents from './DynamicClientComponents';
import ArticleLanguageSwitcher from '@/app/all-articles/[id]/ArticleLanguageSwitcher';
import { ORIGINAL, getPublishedTranslations, postUrl } from '@/app/all-articles/[id]/translations';
import { isMachineTranslationOn } from '@/utils/translate';
import ReadingTracker from '../../components/ReadingTracker';
import { createReadingTicket } from '@/utils/stats/ticket';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

// Fetch the free column
async function fetchFreeColumn(slugOrId) {
  const decodedSlugOrId = decodeURIComponent(slugOrId);

  let apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/free-column?slug=${encodeURIComponent(decodedSlugOrId)}&acf_format=standard&_fields=id,title,acf,date,slug`;

  try {
    let res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (res.ok) {
      const columns = await res.json();
      if (columns && columns.length > 0) {
        return columns[0];
      }
    }

    const isNumeric = !isNaN(decodedSlugOrId) && !isNaN(parseFloat(decodedSlugOrId));

    if (isNumeric) {
      apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/free-column/${decodedSlugOrId}?acf_format=standard&_fields=id,title,acf,date,slug`;
      res = await fetch(apiUrl, {
        next: { revalidate: 10 },
      });

      if (!res.ok) {
        console.error(`Failed to fetch free column with ID ${decodedSlugOrId}: ${res.status} ${res.statusText}`);
        return null;
      }

      return res.json();
    }

    // Not a current slug, and not numeric — it may be a FORMER slug (e.g.
    // a free column whose URL was cleaned up to a Latin slug). Check
    // WordPress's own record of old slugs so shared links keep working.
    const resolveUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/custom/v1/resolve-article-slug?post_type=free-column&slug=${encodeURIComponent(decodedSlugOrId)}`;
    const resolveRes = await fetch(resolveUrl, { next: { revalidate: 10 } });
    if (resolveRes.ok) {
      const resolved = await resolveRes.json();
      if (resolved.found) {
        return {
          id: resolved.id,
          slug: resolved.slug,
          title: resolved.title,
          date: resolved.date,
          acf: resolved.acf,
          _redirectFrom: decodedSlugOrId,
        };
      }
    }

    console.error(`Could not find free column with slug: ${decodedSlugOrId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching free column with slug/id ${decodedSlugOrId}:`, error);
    return null;
  }
}

// Generate Metadata for the Free Column
export async function generateMetadata({ params }) {
  const { id } = params;
  const freeColumn = await englishIfNeeded(await fetchFreeColumn(id));

  if (!freeColumn) {
    return {
      title: 'Free Column Not Found',
      description: 'This free column does not exist.',
    };
  }

  // Admins edit the "title" field in the meta box as the real editorial
  // title; the native WP title (top of the editor) is a separate field
  // that's easy to forget to keep in sync. Prefer the ACF field so the
  // site shows whatever the admin actually intended.
  const decodedTitle = decode(freeColumn.acf.title || freeColumn.title.rendered || '');
  const description = freeColumn.acf.description || freeColumn.acf.sub_title || '';
  const decodedDescription = decode(description);

  let imageUrl = freeColumn.acf.image
    ? freeColumn.acf.image.startsWith('http')
      ? freeColumn.acf.image
      : `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${freeColumn.acf.image}`
    : 'https://www.mautskebeli.ge/images/default-og-image.jpg';

  imageUrl = imageUrl.split('?')[0];

  const metadataBase = new URL('https://www.mautskebeli.ge');
  const georgianPath = freeColumn.slug ? `/free-column/${freeColumn.slug}` : `/free-column/${id}`;
  const lang = getLang();
  const canonicalPath = localizePath(georgianPath, lang);
  // Language versions: hand-made translations + the machine-translated English.
  const published = getPublishedTranslations(freeColumn.acf);
  const machineEnglish = isMachineTranslationOn() && !published.some((tr) => tr.code === 'en');
  const languages = published.length || machineEnglish
    ? {
        ka: georgianPath,
        ...(machineEnglish && { en: localizePath(georgianPath, 'en') }),
        ...Object.fromEntries(published.map((tr) => [tr.code, postUrl('/free-column', freeColumn.slug || id, tr)])),
      }
    : undefined;

  return {
    metadataBase,
    alternates: { canonical: canonicalPath, ...(languages && { languages }) },
    title: decodedTitle,
    description: decodedDescription,
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

function formatDate(dateString) {
  if (getLang() === 'en') return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${dateString}Z`));
  moment.locale('ka');
  return moment(dateString).format('LL');
}

function decodeHTMLEntities(str) {
  return decode(str);
}

function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'blockquote',
      'ul',
      'ol',
      'li',
      'br',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'video',
      'source',
      'audio',
      'figure',
      'figcaption',
      'div',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'class', 'style'],
      video: ['src', 'controls', 'width', 'height', 'poster', 'style'],
      audio: ['src', 'controls'],
      source: ['src', 'type'],
      span: ['style'],
      p: ['style', 'class'],
      blockquote: ['cite', 'style'],
      figure: ['class', 'style'],
      figcaption: ['class'],
      div: ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'data'],
    allowedStyles: {
      '*': {
        width: [/^\d+(?:px|%)$/],
        height: [/^\d+(?:px|%)$/],
        'max-width': [/^\d+(?:px|%)$/],
        'max-height': [/^\d+(?:px|%)$/],
        float: [/^(left|right|none)$/],
        'object-fit': [/^(cover|contain|fill|none|scale-down)$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
      },
    },
    allowVulnerableTags: false,
  });

  const $ = load(sanitized);

  $('blockquote').each((_, elem) => {
    $(elem).css('margin-left', '20px');
    $(elem).css('padding-left', '15px');
    $(elem).css('border-left', '5px solid #ccc');
    $(elem).css('font-style', 'italic');
  });

  $('a').each((_, elem) => {
    $(elem).attr('target', '_blank');
    $(elem).attr('rel', 'noopener noreferrer');
  });

  return $.html();
}

const FreeColumnPage = async ({ params }) => {
  const lang = getLang();
  const t = (ka) => translateUi(lang, ka);
  const localize = (path) => localizePath(path, lang);
  const { id } = params;
  const original = await fetchFreeColumn(id);
  // English site + a hand-made English translation: show that page.
  const humanEnglish = lang === 'en' && original
    ? getPublishedTranslations(original.acf).find((tr) => tr.code === 'en')
    : null;
  if (humanEnglish) {
    redirect(localize(postUrl('/free-column', original.slug || id, humanEnglish)));
  }
  const freeColumn = await englishIfNeeded(original);

  if (!freeColumn) {
    notFound();
  }

  if (freeColumn._redirectFrom && freeColumn.slug) {
    redirect(localize(`/free-column/${freeColumn.slug}`));
  }

  freeColumn.formattedDate = formatDate(freeColumn.date);
  freeColumn.title.rendered = decodeHTMLEntities(freeColumn.acf.title || freeColumn.title.rendered);

  let sanitizedContent = getSanitizedContent(freeColumn.acf['main-text']);

  const $ = load(sanitizedContent);

  $('img, video, audio, source').each((i, elem) => {
    let src = $(elem).attr('src');
    if (src && !src.startsWith('http')) {
      src = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${src}`;
    }
    if (elem.tagName === 'img') {
      src = src?.replace(/-\d+x\d+(?=\.\w{3,4}$)/, '');
      $(elem).removeAttr('width');
      $(elem).removeAttr('height');
    }
    $(elem).attr('src', src);
  });

  sanitizedContent = $.html();

  const publishedTranslations = getPublishedTranslations(freeColumn.acf);

  // Reading statistics: null (no tracker) unless statistics are switched on.
  const readingTicket = createReadingTicket({ type: 'free-column', postId: freeColumn.id, lang });

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={localize(category.path)}
              className={`text-sm text-[#474F7A] ${
                category.name === 'თავისუფალი სვეტი'
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
            src={
              freeColumn.acf.image ||
              '/images/default-og-image.jpg'
            }
            alt={freeColumn.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />

          {lang !== 'en' && (
            <ArticleLanguageSwitcher
              slug={freeColumn.slug || id}
              current={ORIGINAL}
              published={publishedTranslations}
              basePath="/free-column"
            />
          )}
        </div>

        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {freeColumn.title.rendered}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {freeColumn.acf.sub_title}
        </h3>
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
          {freeColumn.acf['ავტორი']}
        </h2>
        <p className="text-[#474F7A] font-semibold pb-10">
          {freeColumn.formattedDate}
        </p>
        {freeColumn.acf.full_column_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            იხილეთ თავისუფალი სვეტის{' '}
            <a
              href={localize(freeColumn.acf.full_column_pdf)}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="underline"
            >
              {t("პდფ ვერსია")}
            </a>
          </p>
        )}

        <MachineTranslationNote />
        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        <DynamicClientComponents
          id={id}
          title={freeColumn.title.rendered}
        />
        <ReadingTracker ticket={readingTicket} />
      </div>

      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default FreeColumnPage;
