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

  const truncateText = (text, limit) => {
    const words = text.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return text;
  };

  const decodeHTMLEntities = (str) => {
    const doc = new DOMParser().parseFromString(str, "text/html");
    return doc.documentElement.textContent;
  };

  const verifyImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`);
        
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
    <section className="mx-auto mt-[110px] flex flex-col">
      <style jsx global>{`
        @media (max-width: 768px) {
          .article:first-child {
            flex: 0 0 100%;
          }

          .articles-container {
            flex-wrap: nowrap;
          }

          .article:not(:first-child){
            flex: 0 0 100%;
          }

          .article {
            flex: 0 0 auto;
          }
        }
      `}</style>
      <div className="w-full sm:w-10/12 flex items-center justify-between mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="text-[#474F7A] text-[24px] font-bold">სტატიები</p>
        <Link href='/all-articles' className="text-[#474F7A] text-[14px] font-semibold">ნახე ყველა</Link>
      </div>
      <div className="w-10/12 mx-auto flex articles-container overflow-x-auto mt-5 flex-row gap-5">
        {articles.map(article => {
          const imageUrl = article.acf.image ? article.acf.image : '/images/default-image.png';
          return (
            <Link href={`/all-articles/${article.id}`} passHref key={article.id}>
              <div className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden" style={{ minWidth: '300px' }}>
                <div className="article-image-container relative w-full h-[200px]">
                  <Image
                    src={imageUrl}
                    alt="article-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover'}} // Correct usage in Next.js 13
                    className="article-image"
                    priority
                  />
                </div>
                <div className="p-[18px]">
                  <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                    {article.title.rendered}
                  </h2>
                  <span className="text-[#8D91AB] text-[14px] font-bold">
                    {article.acf['ავტორი']}
                  </span>
                  <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
                    {truncateText(stripHtml(article.acf['main-text']), 30)}
                  </p>
                  <div className="flex flex-col justify-end pt-[30px] items-end">
                    <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
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
