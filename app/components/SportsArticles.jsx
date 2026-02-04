'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SportsArticles = ({ compact = false }) => {
  const [articles, setArticles] = useState([]);

  const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/sport-article?acf_format=standard&_fields=id,title,acf,date,slug&per_page=3&_=${Date.now()}`
        );
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setArticles(sorted.slice(0, 3));
      } catch (e) {
        console.error('Error fetching sport articles:', e);
      }
    };
    fetchArticles();
  }, []);

  return (
    <section className={`mx-auto w-11/12 md:w-10/12 flex flex-col ${compact ? 'mt-8 lg:mt-10' : 'mt-12 lg:mt-16'}`}>
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-[#FECE27] rounded-full" />
          <h2 className="text-white text-2xl lg:text-3xl font-bold drop-shadow-sm">სტატიები</h2>
        </div>
        <Link
          href="/sport-articles"
          className="text-white/90 text-sm font-semibold hover:text-[#FECE27]
                     transition-colors duration-300 flex items-center gap-2 group"
        >
          <span>ნახე ყველა</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex lg:hidden overflow-x-auto gap-4 pb-4 -mx-4 px-4 hide-scroll-bar">
        {articles.map((article) => {
          const imageUrl = article.acf?.image || '/images/default-image.png';
          const href = `/sport-articles/${article.id}`;
          return (
            <Link href={href} key={article.id} className="group flex-none w-[300px]">
              <div className="bg-[#F6F4F8] rounded-xl border border-[#E0DBE8] overflow-hidden flex flex-col h-[500px]
                             shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative w-full h-[200px] flex-shrink-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-base font-bold mb-2 text-[#474F7A] group-hover:text-[#5F4AA5] transition-colors duration-300 line-clamp-2">
                    {article.title?.rendered}
                  </h2>
                  <span className="text-[#8D91AB] text-sm font-medium">
                    {article.acf?.['ავტორი']}
                  </span>
                  <p className="text-sm pt-4 text-[#474F7A]/80 line-clamp-3">
                    {stripHtml(article.acf?.['main-text'])}
                  </p>
                  <div className="flex justify-end pt-4 mt-auto">
                    <span className="text-[#5F4AA5] text-xs font-semibold bg-[#FECE27] rounded-full py-2 px-4
                                   group-hover:bg-[#FECE27]/90 group-hover:shadow-md transition-all duration-300">
                      ნახეთ სრულად
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-5">
        {articles.map((article) => {
          const imageUrl = article.acf?.image || '/images/default-image.png';
          const href = `/sport-articles/${article.id}`;
          return (
            <Link href={href} key={article.id} className="group">
              <div className="bg-[#F6F4F8] rounded-xl border border-[#E0DBE8] overflow-hidden flex flex-col h-[490px]
                             shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative w-full h-[200px] flex-shrink-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold mb-2 text-[#474F7A] group-hover:text-[#AD88C6] transition-colors duration-300 line-clamp-2">
                    {article.title?.rendered}
                  </h2>
                  <span className="text-[#8D91AB] text-sm font-medium">
                    {article.acf?.['ავტორი']}
                  </span>
                  <p className="text-sm pt-4 text-[#474F7A]/80 line-clamp-3">
                    {stripHtml(article.acf?.['main-text'])}
                  </p>
                  <div className="flex justify-end pt-4 mt-auto">
                    <span className="text-[#5F4AA5] text-xs font-semibold bg-[#FECE27] rounded-full py-2 px-4
                                   group-hover:bg-[#FECE27]/90 group-hover:shadow-md transition-all duration-300">
                      ნახეთ სრულად
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SportsArticles;
