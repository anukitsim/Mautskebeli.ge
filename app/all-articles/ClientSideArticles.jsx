'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWRInfinite from 'swr/infinite';
import { mutate } from 'swr';

// Utility function to decode HTML entities
const decodeHTMLEntities = (text) => {
  if (typeof window === 'undefined') {
    return text.replace(/&#8211;/g, '–').replace(/&#8230;/g, '...'); // Safeguard for server-side
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

export default function ClientSideArticles({ initialArticles }) {
  const loadMoreRef = useRef(null);
  
  // Ensure processedArticles is initialized with an array
  const [processedArticles, setProcessedArticles] = useState(initialArticles || []);

  // SWR Fetcher with cache-busting query
  const fetcher = (url) => fetch(`${url}&_=${new Date().getTime()}`).then((res) => res.json());

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // No more articles to load
    return `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0, // Disable interval
  });

  const articles = Array.isArray(data) ? [].concat(...data) : initialArticles || [];

  useEffect(() => {
    if (Array.isArray(articles)) {
      const processed = articles.map((article) => ({
        ...article,
        title: {
          rendered: decodeHTMLEntities(article.title.rendered)
        },
        acf: {
          ...article.acf,
          ['main-text']: truncateText(decodeHTMLEntities(stripHtml(article.acf?.['main-text'] || '')), 30),
        },
      }));
      if (JSON.stringify(processedArticles) !== JSON.stringify(processed)) {
        setProcessedArticles(processed);
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

  const refreshArticles = () => {
    mutate(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article`);
  };

  if (error) return <div>Error loading articles.</div>;

  return (
    <section className="mx-auto flex flex-col overflow-hidden">
      <div className="w-full sm:w-11/12 md:w-10/12 lg:w-10/12 xl:w-9/12 mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-[#474F7A] text-[24px] font-bold mt-5 lg:mt-14 pl-4 lg:pl-2">
            სტატიები
          </p>
          <button
            onClick={refreshArticles}
            className="text-white bg-blue-500 px-4 py-2 rounded"
          >
            Refresh Articles
          </button>
        </div>
        <p className="text-[#8D91AB] text-wrap pl-4 text-[14px] font-bold lg:pl-2 pt-5 w-11/12 lg:w-9/12 lg:text-justify mb-10">
          „მაუწყებელი“ მიზნად ისახავს საზოგადოებრივად მნიშვნელოვანი, მაგრამ პოლიტიკური დღის წესრიგის მიერ უგულებელყოფილი საკითხების წინ წამოწევას და გთავაზობთ ანალიტიკურ სტატიებს.
        </p>

        {isValidating && processedArticles.length === 0 ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {Array.isArray(processedArticles) && processedArticles.length > 0 && processedArticles.map((article) => (
              <Link href={`/all-articles/${article.id}`} passHref key={article.id}>
                <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={article.acf?.image || '/images/default-image.png'}
                      alt="article-cover"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="article-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-[18px]">
                    <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                      {article.title?.rendered || 'Untitled Article'}
                    </h2>
                    <span className="text-[#8D91AB] text-[14px] font-bold">
                      {article.acf?.['ავტორი'] || 'Unknown Author'}
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

        {isValidating && processedArticles.length > 0 && (
          <div ref={loadMoreRef} className="h-10 w-full flex justify-center items-center">
            <img src="/images/loader.svg" alt="Loading more articles" />
          </div>
        )}

        {!isValidating && <div ref={loadMoreRef} className="h-10 w-full"></div>}
      </div>
    </section>
  );
}

