'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWRInfinite from 'swr/infinite';

// Utility function to decode HTML entities
const decodeHTMLEntities = (text) => {
  if (!text) return ''; // Safeguard for null or undefined texts

  // Server-side fallback or client-side handling
  if (typeof window === 'undefined') {
    return text
      .replace(/&#8211;/g, '–')
      .replace(/&#8230;/g, '...')
      .replace(/\\u[\dA-F]{4}/gi, decodeURIComponent); // Attempt to decode Unicode escapes
  } else {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
};

// Helper function to strip HTML and truncate text
const stripHtml = (html) => {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } else {
    return html.replace(/<[^>]+>/g, ''); // Remove tags for server-side
  }
};

const truncateText = (text, limit) => {
  const words = text.split(' ');
  if (words.length > limit) {
    return words.slice(0, limit).join(' ') + '...';
  }
  return text;
};

export default function ClientSideFreeColumn({ initialArticles }) {
  const loadMoreRef = useRef(null);

  // State to store processed articles
  const [processedArticles, setProcessedArticles] = useState(initialArticles || []);

  // Use SWR for infinite scrolling
  const fetcher = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return []; // Return an empty array to prevent further breakage
    }
  };

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // No more articles to load
    return `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000,
  });

  // Safeguard: Ensure articles is always an array
  const articles = Array.isArray(data) ? [].concat(...data) : initialArticles || [];

  // Track previous processed articles to prevent infinite updates
  const previousArticlesRef = useRef(processedArticles);

  // Process the articles (decode entities, strip HTML, and truncate text)
  useEffect(() => {
    if (Array.isArray(articles)) {
      const processed = articles.map((article) => ({
        ...article,
        title: {
          // Optional chaining to check if `article.title` and `article.title.rendered` exist
          rendered: article?.title?.rendered
            ? decodeHTMLEntities(article.title.rendered)
            : 'Untitled Article', // Provide fallback if title is missing
        },
        acf: {
          ...article.acf,
          ['main-text']: truncateText(decodeHTMLEntities(stripHtml(article.acf?.['main-text'] || '')), 30),
        },
      }));

      // Only update the state if processed articles differ from previous ones
      if (JSON.stringify(previousArticlesRef.current) !== JSON.stringify(processed)) {
        setProcessedArticles(processed);
        previousArticlesRef.current = processed;
      }
    }
  }, [articles]);

  // Infinite scrolling logic
  useEffect(() => {
    if (!loadMoreRef.current || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize(size + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isValidating, setSize, size]);

  // Handle errors
  if (error) return <div>Error loading articles.</div>;

  return (
    <section className="mx-auto flex flex-col overflow-hidden">
      <div className="w-full sm:w-11/12 md:w-10/12 lg:w-10/12 xl:w-9/12 mx-auto">
        <p className="text-[#474F7A] text-[24px] font-bold mt-5 lg:mt-14 pl-4 lg:pl-2">
          თავისუფალი სვეტი
        </p>
        <p className="text-[#8D91AB] text-wrap pl-4 text-[14px] font-bold lg:pl-2 pt-5 w-11/12 lg:w-9/12 lg:text-justify mb-10">
          ფართო, ინკლუზიური და რადიკალური დემოკრატიის იდეის კრიზისის ფონზე,
          „მაუწყებელი“ მიზნად ისახავს მხარი დაუჭიროს ადგილობრივი ხმების
          გაჟღერებას და თავისუფალ პლატფორმას უთმობს ავტორებს,
          რომელთაც სურთ სოციალურ-ეკონომიკურ საკითხებსა და ქვეყანაში მიმდინარე
          მოვლენებზე სტატიების გამოქვეყნება.
        </p>

        {/* Initial Loading */}
        {isValidating && processedArticles.length === 0 ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading" /> {/* Custom loader */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {Array.isArray(processedArticles) &&
              processedArticles.length > 0 &&
              processedArticles.map((article) => (
                <Link href={`/free-column/${article.id}`} passHref key={article.id}>
                  <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                    <div className="relative w-full h-[200px]">
                      <Image
                        src={article.acf?.image || '/images/default-image.png'}
                        alt="article-cover"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-image.png';
                        }}
                      />
                    </div>
                    <div className="p-[18px]">
                      <h2
                        className="text-[20px] font-bold mb-2"
                        style={{ color: '#474F7A' }}
                      >
                        {article.title?.rendered || 'Untitled Article'} {/* Safeguard for missing title */}
                      </h2>
                      <span className="text-[#8D91AB] text-[14px] font-bold">
                        {article.acf?.['ავტორი'] || 'Unknown Author'} {/* Handle missing author */}
                      </span>
                      <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
                        {article.acf?.['main-text']}
                      </p>
                      <div className="flex flex-col justify-end pt-[30px] items-end">
                        <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                          ნახეთ სრულად
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* Infinite Scrolling Loader */}
        {isValidating && processedArticles.length > 0 && (
          <div ref={loadMoreRef} className="h-10 w-full flex justify-center items-center">
            <img src="/images/loader.svg" alt="Loading more articles" />
          </div>
        )}

        {/* Infinite scroll trigger */}
        {!isValidating && <div ref={loadMoreRef} className="h-10 w-full"></div>}
      </div>
    </section>
  );
}
