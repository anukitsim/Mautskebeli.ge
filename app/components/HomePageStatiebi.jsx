"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HomePageStatiebi = () => {
  const [articles, setArticles] = useState([]);

  const truncateText = (text, limit) => {
    const words = text.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return text;
  };

  useEffect(() => {
    fetch('http://mautskebeli.local/wp-json/wp/v2/article?acf_format=standard&_fields=id,title,acf,date')
      .then(response => response.json())
      .then(data => {
        // Sort the articles by date, newest first.
        const sortedArticles = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Then slice the first 3 articles after sorting.
        const lastThreeArticles = sortedArticles.slice(0, 3);
        setArticles(lastThreeArticles);
      })
      .catch(error => console.error('Error fetching articles:', error));
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
            flex: 0 0 100%
          }

          .article {
            flex: 0 0 auto;
          }
        }
      `}</style>
      <div className="w-full sm:w-10/12 flex justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="section-title">სტატიები</p>
        <p className="see-all">ნახე ყველა</p>
      </div>
      <div className="w-10/12 mx-auto flex articles-container overflow-x-auto flex-row gap-5">
        {articles.map(article => (
          <Link href={`/statiebi/${article.id}`} passHref key={article.id} className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden">
            <div className="article-image-container relative w-full h-[200px]"> {/* Fixed height container */}
              <Image
                src={article.acf.image || '/images/default-image.png'} // Fallback for missing images
                alt="article-cover"
                layout="fill"
                objectFit="cover" // This ensures that the image covers the area evenly and maintains aspect ratio
                className="article-image"
              />
            </div>
            <div className="p-[18px]">
              <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                {article.title.rendered}
              </h2>
              <span className="text-[#8D91AB] text-[14px] font-bold">
                {truncateText(article.acf.title, 10)}
              </span>
              <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
                {truncateText(article.acf['main-text'], 30)}
              </p>
              <div className="flex flex-col justify-end pt-[30px] items-end">
                <span className="text-[15px] text-[#AD88C6]">
                  {article.acf.translator} 
                </span>
                <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                  ნახეთ სრულად
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomePageStatiebi;
