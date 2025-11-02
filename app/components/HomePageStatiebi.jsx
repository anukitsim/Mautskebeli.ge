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
      <div className="w-full flex items-center justify-between lg:px-2">
        <p className="text-[#474F7A] text-2xl font-bold">სტატიები</p>
        <Link href='/all-articles' className="text-[#474F7A] text-sm font-semibold">
          ნახე ყველა
        </Link>
      </div>

      {/* Horizontal scrolling section for mobile */}
      <div className="flex lg:hidden overflow-x-auto space-x-4 mt-5 no-scrollbar">
        {articles.map(article => {
          const imageUrl = article.acf.image ? article.acf.image : '/images/default-image.png';
          return (
            <Link href={article.slug ? `/all-articles/${article.slug}` : `/all-articles/${article.id}`} passHref key={article.id}>
              <div className="flex-none w-[300px] bg-[#F6F4F8] rounded-lg border border-[#B6A8CD] overflow-hidden flex flex-col h-[500px]">
                {/* Image Section (Unchanged) */}
                <div className="relative w-full h-[200px] flex-shrink-0"> {/* Added flex-shrink-0 */}
                  <Image
                    src={imageUrl}
                    alt={`Cover image for ${article.title.rendered}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Text Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div>
                    <h2 className="text-base font-bold mb-2 text-[#474F7A]">
                      {article.title.rendered}
                    </h2>
                    <span className="text-[#8D91AB] text-sm font-bold">
                      {article.acf['ავტორი']}
                    </span>
                    <p className="text-sm pt-4 text-black line-clamp-3"> {/* Ensure line-clamp-3 is applied */}
                      {stripHtml(article.acf['main-text'])}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4 mt-auto"> {/* Added mt-auto */}
                    <button
                      aria-label={`Read full article: ${article.title.rendered}`} 
                      className="text-white text-xs bg-[#AD88C6] rounded py-2 px-4"
                    >
                      ნახეთ სრულად
                    </button>
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
            <Link href={article.slug ? `/all-articles/${article.slug}` : `/all-articles/${article.id}`} passHref key={article.id}>
              <div className="bg-[#F6F4F8] rounded-lg border border-[#B6A8CD] overflow-hidden flex flex-col h-[490px]"> {/* Added h-[400px] */}
                {/* Image Section (Unchanged) */}
                <div className="relative w-full h-[200px] flex-shrink-0"> {/* Added flex-shrink-0 */}
                  <Image
                    src={imageUrl}
                    alt={`Cover image for ${article.title.rendered}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover" 
                    priority
                  />
                </div>

                {/* Text Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-[#474F7A]">
                      {article.title.rendered}
                    </h2>
                    <span className="text-[#8D91AB] text-sm font-bold">
                      {article.acf['ავტორი']}
                    </span>
                    <p className="text-sm pt-4 text-black line-clamp-3"> {/* Ensure line-clamp-3 is applied */}
                      {stripHtml(article.acf['main-text'])}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4 mt-auto"> {/* Added mt-auto */}
                    <button
                      aria-label={`Read full article: ${article.title.rendered}`} 
                      className="text-white text-xs bg-[#AD88C6] rounded py-2 px-4"
                    >
                      ნახეთ სრულად
                    </button>
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
