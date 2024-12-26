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

// Fetch the translation
async function fetchTranslation(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani/${id}?acf_format=standard&_fields=id,title,acf,date`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 10 } });
    if (!res.ok) {
      console.error(`Failed to fetch translation with id ${id}: ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching translation with id ${id}:`, error);
    return null;
  }
}

// Metadata for SEO and social sharing
export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await fetchTranslation(id);

  if (!article) {
    return {
      title: 'Translation Not Found',
      description: 'This translation does not exist.',
    };
  }

  const decodedTitle = decode(article.title.rendered || '');
  const description = article.acf.description || article.acf.sub_title || '';
  const imageUrl = article.acf.image || 'https://www.mautskebeli.ge/images/default-og-image.jpg'; // Use the main image

  return {
    title: decodedTitle,
    description,
    openGraph: {
      title: decodedTitle,
      description,
      url: `https://www.mautskebeli.ge/translate/${id}`,
      type: 'article',
      images: [imageUrl], // Always use the main image
      locale: 'ka_GE',
      siteName: 'Mautskebeli',
    },
    twitter: {
      card: 'summary_large_image',
      title: decodedTitle,
      description,
      images: [imageUrl], // Always use the main image
    },
  };
}


function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

// Sanitize and process the content
function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: { img: ['src', 'alt', 'title'], a: ['href', 'target', 'rel'] },
  });

  const $ = load(sanitized);
  $('a').attr('target', '_blank').attr('rel', 'noopener noreferrer');
  $('blockquote').css({ 'border-left': '5px solid #ccc', 'padding-left': '15px', 'margin-left': '20px' });
  return $.html();
}

const TranslationPage = async ({ params }) => {
  const { id } = params;
  const translation = await fetchTranslation(id);

  if (!translation) {
    notFound();
  }

  const formattedDate = formatDate(translation.date);
  const sanitizedContent = getSanitizedContent(translation.acf['main-text'] || '');

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.path}
              className={`text-sm text-[#474F7A] ${
                category.name === 'თარგმანი'
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
            src={translation.acf.image || '/images/default-og-image.jpg'}
            alt={translation.title.rendered}
            width={800}
            height={450}
            className="rounded-lg w-full"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {translation.title.rendered}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {translation.acf.sub_title}
        </h3>
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
          {translation.acf['ავტორი']}
        </h2>
        <p className="text-[#474F7A] font-semibold pb-10">
          {formattedDate}
        </p>
        {translation.acf.full_article_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            იხილეთ სტატიის{' '}
            <a
              href={translation.acf.full_article_pdf}
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
        <DynamicClientComponents id={id} title={translation.title.rendered} />
      </div>
    </section>
  );
};

export default TranslationPage;
