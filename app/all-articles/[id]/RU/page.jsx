// app/all-articles/[id]/ENG/page.jsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio'; // Updated import
import ShareButtons from './ShareButtons';
import LanguageDropdown from './LanguageDropdown';
import ScrollToTopButton from './ScrollToTopButton';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

async function fetchArticle(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`;
  const res = await fetch(apiUrl);

  if (!res.ok) {
    return null;
  }
  return res.json();
}

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

function decodeHTMLEntities(str) {
  return decode(str);
}

// Function to sanitize content
function getSanitizedContent(content) {
  return sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'blockquote',
      'ul', 'ol', 'li', 'br', 'span', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'img', 'code', 'pre'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['style'],
      'p': ['style'],
      'blockquote': ['cite'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowedStyles: {
      '*': {
        'color': [/^#[0-9a-fA-F]{3,6}$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/],
        'font-weight': [/^bold$/],
        'text-align': [/^(left|right|center|justify)$/],
      },
    },
    allowVulnerableTags: false,
  });
}

// Extract the first few words for the description
function extractDescription(content, wordLimit = 30) {
  // Remove all HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Split into words
  const words = text.split(/\s+/);
  // Take the first `wordLimit` words
  const shortText = words.slice(0, wordLimit).join(' ');
  return shortText + (words.length > wordLimit ? '...' : '');
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    return {};
  }

  // Sanitize and extract description from the main article text
  const sanitizedMainText = getSanitizedContent(article.acf.language2_main_text); // Sanitize the main text
  const description = extractDescription(sanitizedMainText, 30); // Extract the first 30 words (adjust as needed)

  return {
    title: `${article.acf.language2_title} - Russian Version`,
    description: description || 'An article in Russian.',
    openGraph: {
      title: article.acf.language2_title,
      description: description,
      url: `https://www.mautskebeli.ge/all-articles/${article.id}/RU`,
      images: [
        {
          url: article.acf.language2_image || '/images/default-og-image.jpg',
        },
      ],
    },
    twitter: {
      title: article.acf.language2_title,
      description: description,
      images: [article.acf.language2_image || '/images/default-og-image.jpg'],
    },
  };
}

const Language2Page = async ({ params }) => {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    notFound();
  }

  // Process article data
  article.formattedDate = formatDate(article.date);
  article.title.rendered = decodeHTMLEntities(article.acf.language2_title);

  // Sanitize and process the language2 main text
  let sanitizedContent = getSanitizedContent(article.acf.language2_main_text);

  // Use cheerio to manipulate the HTML content
  const $ = load(sanitizedContent); // Updated code

  $('a').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href && !href.startsWith('/') && !href.startsWith('#')) {
      $(elem).attr('target', '_blank');
      $(elem).attr('rel', 'noopener noreferrer');
    }
  });

  $('blockquote').each((i, elem) => {
    $(elem).css('margin-left', '20px');
    $(elem).css('padding-left', '15px');
    $(elem).css('border-left', '5px solid #ccc');
  });

  sanitizedContent = $.html();

  // Determine if the language dropdown should be shown
  const showLanguageDropdown = article.acf.language1_title || article.acf.language2_title;

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
            src={article.acf.language2_image || '/images/default-og-image.jpg'}
            alt={article.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />

          {/* Language Dropdown */}
          {showLanguageDropdown && (
            <LanguageDropdown id={id} currentLanguage="language2" />
          )}

          <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
            {article.title.rendered}
          </h1>
          <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
            {article.acf.language2_sub_title}
          </h3>
          <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
            {article.acf.language2_ავტორი}
          </h2>
          <p className="text-[#474F7A] font-semibold pb-10">
            {article.formattedDate}
          </p>
          {article.acf.language2_pdf && (
            <p className="text-[#474F7A] font-semibold pb-10">
              იხილეთ სტატიის{' '}
              <a
                href={article.acf.language2_pdf}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="underline"
              >
                პდფ ვერსია
              </a>
            </p>
          )}
        </div>

        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        {/* Share Buttons */}
        <ShareButtons articleId={article.id} title={article.title.rendered} />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default Language2Page;
