"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AllArticlesList = () => {
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

  useEffect(() => {
    const fetchArticles = async (page = 1, articles = []) => {
      try {
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani?acf_format=standard&_fields=id,title,acf,date&per_page=20&page=${page}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const newArticles = [...articles, ...data];
        
        if (data.length === 20) {
          return fetchArticles(page + 1, newArticles);
        } else {
          setArticles(newArticles);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <section className="container mx-auto flex flex-col p-4">
      <div className="w-full flex items-center justify-between mt-8 sm:mt-12 lg:mt-20">
        <p className="text-[#474F7A] text-2xl sm:text-3xl font-bold">თარგმანი</p>
      </div>
      <div className="w-full grid gap-5 mt-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {articles.map(article => (
          <Link href={`/translate/${article.id}`} passHref key={article.id}>
            <div className="article bg-[#F6F4F8] rounded-lg border border-[#B6A8CD] overflow-hidden">
              <div className="relative w-full h-48 sm:h-56 lg:h-64">
                <Image
                  src={article.acf.image ? article.acf.image : '/images/default-image.png'}
                  alt="article-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="article-image"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 text-[#474F7A]">
                  {article.title.rendered}
                </h2>
                <span className="text-[#8D91AB] text-sm sm:text-base font-bold">
                {article.acf['მთარგმნელი']}
                </span>
                <div className="flex flex-col justify-end items-end mt-4 sm:mt-6">
                  <span className="text-sm sm:text-base text-[#AD88C6]">
                    {article.acf.translator} 
                  </span>
                  <button className="text-white text-xs sm:text-sm mt-4 bg-[#AD88C6] rounded-md py-2 px-3">
                    ნახეთ სრულად
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AllArticlesList;
