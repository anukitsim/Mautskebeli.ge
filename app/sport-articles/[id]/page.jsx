// app/sport-articles/[id]/page.jsx

import React from 'react';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import Image from 'next/image';

// Import the new Client Component
import DynamicClientComponents from './DynamicClientComponents';

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

const Page = async ({ params }) => {
  const { id } = params;
  const article = await fetchArticle(id); // Ensure fetchArticle is defined or imported

  if (!article) {
    notFound();
  }

  // Process article data
  article.formattedDate = formatDate(article.date); // Ensure formatDate is defined or imported
  article.title.rendered = decodeHTMLEntities(article.title.rendered); // Ensure decodeHTMLEntities is defined or imported

  // Sanitize and process the main text
  let sanitizedContent = getSanitizedContent(article.acf['main-text']); // Ensure getSanitizedContent is defined or imported

  // Use Cheerio to manipulate and enhance the HTML content
  const $ = load(sanitizedContent);

  // Ensure all media sources have absolute URLs
  $('img, video, audio, source').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src && !src.startsWith('http')) {
      $(elem).attr(
        'src',
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${src}`
      );
    }
  });

  // Style blockquotes
  $('blockquote').each((i, elem) => {
    $(elem).css('margin-left', '20px');
    $(elem).css('padding-left', '15px');
    $(elem).css('border-left', '5px solid #ccc');
    $(elem).css('font-style', 'italic');
  });

  sanitizedContent = $.html();

  // Determine if the language dropdown should be shown
  const showLanguageDropdown =
    article.acf.language1 === true || article.acf.language2 === true;

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
            src={
              article.acf.image ||
              '/images/default-og-image.jpg'
            }
            alt={article.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />

          {/* Language Dropdown */}
          {showLanguageDropdown && (
            <DynamicClientComponents
              id={id}
              title={article.title.rendered}
              showLanguageDropdown={showLanguageDropdown}
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

        {/* Share Buttons */}
        <DynamicClientComponents
          id={id}
          title={article.title.rendered}
          showLanguageDropdown={false} // Hide language dropdown here if not needed
        />
      </div>

      {/* Scroll to Top Button */}
      {/* Already handled within DynamicClientComponents */}
      {/* Remove if DynamicClientComponents already includes ScrollToTopButton */}

      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default Page;
