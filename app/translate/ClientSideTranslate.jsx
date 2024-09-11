'use client'; // Enable React hooks in this component

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWRInfinite from 'swr/infinite';

export default function ClientSideTranslate({ initialArticles }) {
  const loadMoreRef = useRef(null);

  // Use SWR for infinite scrolling
  const fetcher = (url) => fetch(url).then(res => res.json());

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // No more articles to load
    return `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani?acf_format=standard&_fields=id,title,acf,date&per_page=10&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: true, // Refetch when the page comes back into focus
    refreshInterval: 60000,  // Auto-refetch every 60 seconds
  });

  // Combine server-side articles with SWR articles (pagination)
  const articles = data ? [].concat(...data) : initialArticles;

  // State to store stripped and truncated articles (only applied on client-side)
  const [processedArticles, setProcessedArticles] = useState(initialArticles);

  // Client-side HTML stripping and text truncation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      };

      const truncateText = (text, limit) => {
        const words = text.split(' ');
        if (words.length > limit) {
          return words.slice(0, limit).join(' ') + '...';
        }
        return text;
      };

      // Process the articles: strip HTML and truncate text
      const processed = articles.map(article => ({
        ...article,
        acf: {
          ...article.acf,
          ['main-text']: truncateText(stripHtml(article.acf?.['main-text'] || ''), 30) // Strip and truncate
        }
      }));

      setProcessedArticles(processed); // Store the processed articles in state
    }
  }, [articles]);

  // Infinite scrolling logic
  useEffect(() => {
    if (!loadMoreRef.current || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize(size + 1); // Load the next page of articles
        }
      },
      {
        rootMargin: '200px', // Load more articles before reaching the bottom
      }
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
          თარგმანი
        </p>
        <p className="text-[#8D91AB] text-wrap pl-4 text-[14px] font-bold lg:pl-2 pt-5 w-11/12 lg:w-9/12 lg:text-justify mb-10">
          „მაუწყებელი“ ისწრაფვის პოლიტიკურად მნიშვნელოვანი ცოდნის გავრცელების
          ხელშეწყობისკენ და გთავაზობთ ანალიტიკური სტატიებისა და წიგნების ქართულ
          თარგმანს.
        </p>

        {/* Initial Loading */}
        {isValidating && processedArticles.length === 0 ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading" /> {/* Custom loader */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {processedArticles.map((article) => (
              <Link href={`/translate/${article.id}`} passHref key={article.id}>
                <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={article.acf?.image || "/images/default-image.png"} 
                      alt="article-cover"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="article-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-image.png";
                      }}
                    />
                  </div>
                  <div className="p-[18px]">
                    <h2
                      className="text-[20px] font-bold mb-2"
                      style={{ color: "#474F7A" }}
                    >
                      {article.title?.rendered || 'Untitled Article'} {/* Handle missing title */}
                    </h2>
                    <span className="text-[#8D91AB] text-[14px] font-bold">
                      {article.acf?.["მთარგმნელი"] || "Unknown"} {/* Handle missing translator */}
                    </span>
                    <p className="text-sm pt-[18px]" style={{ color: "#000" }}>
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
