import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import ShareButtons from './ShareButtons';
import ScrollToTopButton from './ScrollToTopButton';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

async function fetchArticle(id) {
  const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani/${id}?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.error(`Failed to fetch article with id ${id}: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching article with id ${id}:`, error);
    return null;
  }
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

function extractDescription(content, wordLimit = 30) {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/);
  const shortText = words.slice(0, wordLimit).join(' ');
  return shortText + (words.length > wordLimit ? '...' : '');
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await fetchArticle(id);

  if (!article) {
    return {};
  }

  const sanitizedMainText = getSanitizedContent(article.acf['main-text']);
  const description = extractDescription(sanitizedMainText, 30);

  return {
    title: article.title.rendered,
    description: description || 'An article.',
    openGraph: {
      title: article.title.rendered,
      description: description,
      url: `https://www.mautskebeli.ge/translate/${article.id}`,
      images: [{ url: article.acf.image || '/images/default-og-image.jpg' }],
    },
    twitter: {
      title: article.title.rendered,
      description: description,
      images: [article.acf.image || '/images/default-og-image.jpg'],
    },
  };
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

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a key={category.name} href={category.path} className={`text-sm text-[#474F7A] ${category.name === 'თარგმანი' ? 'text-white font-bold' : 'hover:scale-110'}`}>
              {category.name}
            </a>
          ))}
        </div>
        <div className="w-full h-auto mb-5">
          <Image src={article.acf.image || '/images/default-og-image.jpg'} alt={article.title.rendered} width={800} height={450} style={{ objectFit: 'cover' }} className="rounded-lg w-full" />
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
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[20px] font-semibold text-[#AD88C6]  leading-normal mb-5">
  {article.acf['მთარგმნელი']}
</h2>
        <p className="text-[#474F7A] font-semibold pb-10">
          {article.formattedDate}
        </p>
        {article.acf.full_article_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            იხილეთ სტატიის{' '}
            <a href={article.acf.full_article_pdf} target="_blank" rel="noopener noreferrer" download className="underline">
              პდფ ვერსია
            </a>
          </p>
        )}
        <div className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5" dangerouslySetInnerHTML={{ __html: sanitizedContent }}></div>
        <ShareButtons articleId={article.id} title={article.title.rendered} />
      </div>
      <ScrollToTopButton />
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ArticlePage;
