'use client';

import { useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

// Enhanced sanitization for WYSIWYG content
function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'blockquote',
      'ul', 'ol', 'li', 'br', 'span', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'img', 'video', 'source', 'audio', 'figure', 'figcaption'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'style'], // Preserve resizing attributes
      'video': ['src', 'controls', 'width', 'height', 'poster', 'style'],
      'audio': ['src', 'controls'],
      'source': ['src', 'type'],
      'span': ['style'],
      'p': ['style'],
      'blockquote': ['cite', 'style'],
      'figure': [],
      'figcaption': [],
    },
    allowedSchemes: ['http', 'https', 'data'],
    allowedStyles: {
      '*': {
        'width': [/^\d+(?:px|%)$/], // Allow percentage and pixel-based widths
        'height': [/^\d+(?:px|%)$/],
        'max-width': [/^\d+(?:px|%)$/],
        'max-height': [/^\d+(?:px|%)$/],
        'float': [/^(left|right|none)$/],
        'object-fit': [/^(cover|contain|fill|none|scale-down)$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
      },
    },
    allowVulnerableTags: false,
  });

  // Enhance the content using Cheerio for blockquote styles
  const $ = load(sanitized);

  $('blockquote').each((_, elem) => {
    $(elem).css('margin-left', '20px');
    $(elem).css('padding-left', '15px');
    $(elem).css('border-left', '5px solid #ccc');
    $(elem).css('font-style', 'italic');
  });

  return $.html();
}

const ColumnPage = ({ article }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (article) {
      const content = getSanitizedContent(article.acf['main-text']);
      setSanitizedContent(content);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/images/loader.svg" alt="Loading" />
      </div>
    );
  }

  const formattedDate = formatDate(article.date);

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
          {/* Standard img tag to preserve WYSIWYG resizing */}
          <img
            src={article.acf.image || '/images/default-og-image.jpg'}
            alt={decode(article.acf.title)}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            className="rounded-lg"
          />
          <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-2">
            {decode(article.acf.title)}
          </h1>
          {article.acf.sub_title && (
            <h3 className="font-alk-tall-mtavruli text-[24px] sm:text-[32px] font-light leading-none text-[#474F7A] mt-[12px] mb-5">
              {article.acf.sub_title}
            </h3>
          )}
          {article.acf['ავტორი'] && (
            <h3 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
              {article.acf['ავტორი']}
            </h3>
          )}
          <p className="text-[#474F7A] font-semibold pb-10">{formattedDate}</p>
        </div>
        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px]"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
      </div>
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ColumnPage;