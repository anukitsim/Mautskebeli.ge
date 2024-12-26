import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import React from 'react';

import ShareButtons from './ShareButtons';

// Fetch the book details
async function fetchBook(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/mau-books/${id}?acf_format=standard&_fields=id,title,acf,date`;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch book with id ${id}: ${res.status} ${res.statusText}`);
      return null;
    }

    const book = await res.json();
    return book;
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    return null;
  }
}

// Generate Metadata for the Book
export async function generateMetadata({ params }) {
  const { id } = params;
  const book = await fetchBook(id);

  if (!book) {
    return {
      title: 'Book Not Found',
      description: 'This book does not exist.',
    };
  }

  const decodedTitle = decode(book.title.rendered || '');
  const description = book.acf.text || book.acf.sub_title || '';
  const decodedDescription = decode(description);

  let imageUrl = book.acf.image
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/media/${book.acf.image}`
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
      url: `/books/${id}`,
      type: 'book',
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
      'ul', 'ol', 'li', 'br', 'span', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'img', 'video', 'source', 'audio',
      'figure', 'figcaption',
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

const BookPage = async ({ params }) => {
  const { id } = params;
  const book = await fetchBook(id);

  if (!book) {
    notFound();
  }

  book.formattedDate = formatDate(book.date);
  book.title.rendered = decodeHTMLEntities(book.title.rendered);

  let sanitizedContent = getSanitizedContent(book.acf.text);

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="w-full h-auto mb-5">
          <Image
            src={book.acf.image || '/images/default-og-image.jpg'}
            alt={book.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
        </div>

        <h1 className="text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {book.title.rendered}
        </h1>
        <h3 className="sm:text-[34px] lg:text-[34px] font-light text-[#474F7A] mt-[24px] mb-5">
          {book.acf.sub_title}
        </h3>
        <h2 className="text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] mb-5">
          {book.acf.author}
        </h2>
        <h3 className="text-[14px] sm:text-[20px] text-[#8D91AB] mb-5">
          {book.acf['რეცენზიის_ავტორი']}
        </h3>
        <p className="text-[#474F7A] font-semibold pb-10">
          {book.formattedDate}
        </p>

        <div
          className="text-[#474F7A] text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        {/* Share Buttons */}
        <div className="mt-10">
          <ShareButtons bookId={id} title={book.title.rendered} />
        </div>
      </div>
    </section>
  );
};

export default BookPage;
