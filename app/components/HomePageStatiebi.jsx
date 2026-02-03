'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HomePageStatiebi = () => {
  const [articles, setArticles] = useState([]);

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const decodeHTMLEntities = (str) => {
    const doc = new DOMParser().parseFromString(str, "text/html");
    return doc.documentElement.textContent;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article?acf_format=standard&_fields=id,title,acf,date,slug&_=${new Date().getTime()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.text();
        // Attempt to parse the JSON safely
        let data;
        try {
          data = JSON.parse(rawData);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          return;
        }

        const sortedArticles = data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const lastThreeArticles = sortedArticles.slice(0, 3).map(article => ({
          ...article,
          title: {
            ...article.title,
            rendered: decodeHTMLEntities(article.title.rendered) // Decode HTML entities in titles
          },
          acf: {
            ...article.acf,
            'main-text': decodeHTMLEntities(article.acf['main-text']), // Decode HTML entities in main text
            'ავტორი': decodeHTMLEntities(article.acf['ავტორი']), // Decode HTML entities in author field
            'translator': decodeHTMLEntities(article.acf['translator']), // Decode HTML entities in translator field
          }
        }));

        setArticles(lastThreeArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <section className="mx-auto flex flex-col px-4">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-[#AD88C6] rounded-full" />
          <h2 className="text-[#474F7A] text-2xl lg:text-3xl font-bold">სტატიები</h2>
        </div>
        <Link 
          href="/all-articles" 
          className="text-[#474F7A] text-sm font-semibold hover:text-[#AD88C6] 
                     transition-colors duration-300 flex items-center gap-2 group"
        >
          <span>ნახე ყველა</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Horizontal scrolling section for mobile */}
      <div className="flex lg:hidden overflow-x-auto space-x-4 no-scrollbar">
        {articles.map(article => {
          const imageUrl = article.acf.image ? article.acf.image : '/images/default-image.png';
          return (
            <Link href={article.slug ? `/all-articles/${article.slug}` : `/all-articles/${article.id}`} passHref key={article.id} className="group">
              <div className="flex-none w-[300px] bg-[#F6F4F8] rounded-xl border border-[#E0DBE8] overflow-hidden flex flex-col h-[500px]
                             shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative w-full h-[200px] flex-shrink-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Cover image for ${article.title.rendered}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Text Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div>
                    <h2 className="text-base font-bold mb-2 text-[#474F7A] group-hover:text-[#AD88C6] transition-colors duration-300">
                      {article.title.rendered}
                    </h2>
                    <span className="text-[#8D91AB] text-sm font-medium">
                      {article.acf['ავტორი']}
                    </span>
                    <p className="text-sm pt-4 text-[#474F7A]/80 line-clamp-3">
                      {stripHtml(article.acf['main-text'])}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4 mt-auto">
                    <span
                      className="text-white text-xs bg-[#AD88C6] rounded-full py-2 px-4
                                 group-hover:bg-[#8B6AAE] transition-colors duration-300"
                    >
                      ნახეთ სრულად
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid for desktop screens */}
      <div className="hidden lg:grid w-full mx-auto grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
        {articles.map(article => {
          const imageUrl = article.acf.image ? article.acf.image : '/images/default-image.png';
          return (
            <Link href={article.slug ? `/all-articles/${article.slug}` : `/all-articles/${article.id}`} passHref key={article.id} className="group">
              <div className="bg-[#F6F4F8] rounded-xl border border-[#E0DBE8] overflow-hidden flex flex-col h-[490px]
                             shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative w-full h-[200px] flex-shrink-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Cover image for ${article.title.rendered}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    priority
                  />
                </div>

                {/* Text Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-[#474F7A] group-hover:text-[#AD88C6] transition-colors duration-300">
                      {article.title.rendered}
                    </h2>
                    <span className="text-[#8D91AB] text-sm font-medium">
                      {article.acf['ავტორი']}
                    </span>
                    <p className="text-sm pt-4 text-[#474F7A]/80 line-clamp-3">
                      {stripHtml(article.acf['main-text'])}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4 mt-auto">
                    <span
                      className="text-white text-xs bg-[#AD88C6] rounded-full py-2 px-4
                                 group-hover:bg-[#8B6AAE] transition-colors duration-300"
                    >
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

export default HomePageStatiebi;
