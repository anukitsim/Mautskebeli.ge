// all-articles/[id]/page.jsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import React from 'react';

import DynamicClientComponents from './DynamicClientComponents';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

async function fetchArticle(slugOrId) {
  // Try fetching by slug first
  let apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article?slug=${slugOrId}&acf_format=standard&_fields=id,title,acf,date,slug`;

  try {
    let res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (res.ok) {
      const articles = await res.json();
      if (articles && articles.length > 0) {
        return articles[0];
      }
    }

    // If slug doesn't work, try by ID (for backward compatibility)
    apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article/${slugOrId}?acf_format=standard&_fields=id,title,acf,date,slug`;
    res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch article with slug/id ${slugOrId}: ${res.status} ${res.statusText}`);
      return null;
    }

    const article = await res.json();
    return article;
  } catch (error) {
    console.error(`Error fetching article with slug/id ${slugOrId}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'This article does not exist.',
    };
  }

  const decodedTitle = decode(article.title.rendered || '');
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

  return {
    metadataBase,
    title: decodedTitle,
    description: decodedDescription,
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

function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'blockquote',
      'ul', 'ol', 'li', 'br', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'video', 'source', 'audio', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'style'],
      video: ['src', 'controls', 'width', 'height', 'poster', 'style'],
      audio: ['src', 'controls'],
      source: ['src', 'type'],
      span: ['style'],
      p: ['style'],
      blockquote: ['cite', 'style'],
      figure: [],
      figcaption: [],
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

const ArticlePage = async ({ params }) => {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    notFound();
  }

  article.formattedDate = formatDate(article.date);
  article.title.rendered = decodeHTMLEntities(article.title.rendered);

  let sanitizedContent = getSanitizedContent(article.acf['main-text']);
  const $ = load(sanitizedContent);

  // Convert image URLs to absolute and wrap with high-res links
  $('img').each((i, elem) => {
    let src = $(elem).attr('src');

    // Absolute URL
    if (src && !src.startsWith('http')) {
      src = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${src}`;
      $(elem).attr('src', src);
    }

    // Strip WordPress resizing suffix (e.g. -300x200.jpg => .jpg)
    const highResSrc = src?.replace(/-\d+x\d+(?=\.\w{3,4}$)/, '');

    const imgHtml = $.html(elem);
    const wrapped = `<a href="${highResSrc}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`;
    $(elem).replaceWith(wrapped);
  });

 
  sanitizedContent = $.html();

  /* ─────────────────── translation flags ─────────────────── */
  const hasEng = article.acf.language1 === true;
  const hasRu  = article.acf.language2 === true;
  const showLanguageDropdown = hasEng || hasRu;


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
          {showLanguageDropdown && (
            <DynamicClientComponents
            id={id}
            title={article.title.rendered}
            showLanguageDropdown={showLanguageDropdown}
            hasEng={hasEng}
            hasRu={hasRu}
            currentLanguage="georgian"
            />
          )}
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

       <DynamicClientComponents
          id={id}
          title={article.title.rendered}
          showLanguageDropdown={false}
          hasEng={hasEng}
          hasRu={hasRu}
          currentLanguage="georgian"
          />
      </div>
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ArticlePage;
