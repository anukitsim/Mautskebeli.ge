// app/books/[id]/BookPage.jsx

'use client';

import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ka';
import { decode } from 'html-entities';
import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';
import DynamicClientComponents from './DynamicClientComponents';

const BookPage = ({ params }) => {
  const { id } = params;

  // Fetch and process the book data as per your logic
  // Ensure that links in main text open in new tabs

  // Example sanitized content modification to add target="_blank" to all links
  const getSanitizedContent = (content) => {
    const sanitized = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'span', 'h1', 'h2', 'h3']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'target', 'rel'], // Allow target and rel for links
        img: ['src', 'alt'],
      },
      transformTags: {
        'a': (tagName, attribs) => {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          };
        },
      },
    });

    // Additional processing with Cheerio if needed
    const $ = load(sanitized);

    // Example: Style blockquotes
    $('blockquote').each((_, elem) => {
      $(elem).css('margin-left', '20px');
      $(elem).css('padding-left', '15px');
      $(elem).css('border-left', '5px solid #ccc');
      $(elem).css('font-style', 'italic');
    });

    return $.html();
  };

  // Replace the following with your actual data fetching and processing logic
  const bookData = {
    title: "Sample Book Title",
    description: "Sample Book Description",
    date: "2023-10-01T00:00:00Z",
    content: '<p>This is a <a href="https://example.com">link</a> in the main text.</p>',
    // ... other fields
  };

  // Process book data
  bookData.formattedDate = moment(bookData.date).format('LL');
  bookData.title = decode(bookData.title);
  const sanitizedContent = getSanitizedContent(bookData.content);

  // Determine if the language dropdown should be shown
  const showLanguageDropdown = true; // Replace with your logic

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        {/* Your content structure */}
        <div className="w-full h-auto mb-5">
          <Image
            src="/images/default-og-image.jpg"
            alt={bookData.title}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />

          {/* Language Dropdown */}
          {showLanguageDropdown && (
            <DynamicClientComponents
              id={id}
              title={bookData.title}
              showLanguageDropdown={showLanguageDropdown}
            />
          )}
        </div>

        <h1 className="text-2xl font-bold">{bookData.title}</h1>
        <p className="text-gray-600">{bookData.formattedDate}</p>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>

        {/* Share Buttons */}
        <DynamicClientComponents
          id={id}
          title={bookData.title}
          showLanguageDropdown={false} // Hide language dropdown here if not needed
        />
      </div>

      {/* Scroll to Top Button */}
      <DynamicClientComponents
        id={id}
        title={bookData.title}
        showLanguageDropdown={false} // Hide language dropdown here if not needed
      />

      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default BookPage;
