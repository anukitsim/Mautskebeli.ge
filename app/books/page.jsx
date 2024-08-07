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
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mau-books?acf_format=standard&_fields=id,title,acf,date&per_page=20&page=${page}`);
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
    <section className="mx-auto] flex flex-col">
      <div className="w-full sm:w-10/12 flex items-center justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="text-[#474F7A] text-[24px] font-bold">მაუწყებელი წიგნები</p>
      </div>
      <div className="w-10/12 mx-auto grid gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {articles.map(article => (
          <Link href={`/books/${article.id}`} passHref key={article.id}>
            <div className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden">
              <div className="article-image-container relative w-full h-[200px]">
                <Image
                  src={article.acf.image || '/images/default-image.png'}
                  alt="article-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="article-image"
                />
              </div>
              <div className="p-[18px]">
                <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                  {article.title.rendered}
                </h2>
                <span className="text-[#8D91AB] text-[14px] font-bold">
                {article.acf['ავტორი']}
                </span>
              
                <div className="flex flex-col justify-end pt-[30px] items-end">
                  <span className="text-[15px] text-[#AD88C6]">
                    {article.acf.translator} 
                  </span>
                  <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
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
