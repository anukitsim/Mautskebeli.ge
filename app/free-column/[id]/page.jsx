// app/free-column/[id]/page.jsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import React from 'react';

// Import the Client Component handling dynamic imports
import DynamicClientComponents from './DynamicClientComponents';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

// Fetch the free column
async function fetchFreeColumn(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/free-column/${id}?acf_format=standard&_fields=id,title,acf,date`;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 10 }, // Adjust revalidation as needed
    });

    if (!res.ok) {
      console.error(
        `Failed to fetch free column with id ${id}: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const freeColumn = await res.json();
    return freeColumn;
  } catch (error) {
    console.error(`Error fetching free column with id ${id}:`, error);
    return null;
  }
}

// Generate Metadata for the Free Column
export async function generateMetadata({ params }) {
  const { id } = params;
  const freeColumn = await fetchFreeColumn(id);

  if (!freeColumn) {
    return {
      title: 'Free Column Not Found',
      description: 'This free column does not exist.',
    };
  }

  const decodedTitle = decode(freeColumn.title.rendered || '');
  const description = freeColumn.acf.description || freeColumn.acf.sub_title || '';
  const decodedDescription = decode(description);

  let imageUrl = freeColumn.acf.image
    ? freeColumn.acf.image.startsWith('http')
      ? freeColumn.acf.image
      : `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${freeColumn.acf.image}`
    : 'https://www.mautskebeli.ge/images/default-og-image.jpg';

  imageUrl = imageUrl.split('?')[0];

  const metadataBase = new URL('https://www.mautskebeli.ge');

  return {
    metadataBase,
    title: decodedTitle,
    description: decodedDescription,
    openGraph: {
      title: decodedTitle,
      description: decodedDescription,
      url: `/free-column/${id}`,
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
  const { id } = params;
  const freeColumn = await fetchFreeColumn(id);

  if (!freeColumn) {
    notFound();
  }

  freeColumn.formattedDate = formatDate(freeColumn.date);
  freeColumn.title.rendered = decodeHTMLEntities(freeColumn.title.rendered);

  let sanitizedContent = getSanitizedContent(freeColumn.acf['main-text']);

  const $ = load(sanitizedContent);

  $('img, video, audio, source').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src && !src.startsWith('http')) {
      $(elem).attr(
        'src',
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${src}`
      );
    }
  });

  sanitizedContent = $.html();

  const showLanguageDropdown =
    freeColumn.acf.language1 === true || freeColumn.acf.language2 === true;

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.path}
              className={`text-sm text-[#474F7A] ${
                category.name === 'თავისუფალი სვეტი'
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

          {showLanguageDropdown && (
            <DynamicClientComponents
              id={id}
              title={freeColumn.title.rendered}
              showLanguageDropdown={showLanguageDropdown}
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
              href={freeColumn.acf.full_column_pdf}
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
          title={freeColumn.title.rendered}
          showLanguageDropdown={false}
        />
      </div>

      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default FreeColumnPage;
