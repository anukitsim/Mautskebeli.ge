'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AllArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = 'cachedSportArticles';
  const CACHE_TIMESTAMP_KEY = 'cacheSportTimestamp';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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

  const fetchArticles = async (page = 1, articles = []) => {
    try {
      const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/sport-article?acf_format=standard&_fields=id,title,acf,date&per_page=20`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const newArticles = [...articles, ...data];
      
      if (data.length === 20) {
        return fetchArticles(page + 1, newArticles);
      } else {
        setArticles(newArticles);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newArticles));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshArticles = async () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    await fetchArticles();
  };

  useEffect(() => {
    const loadArticles = async () => {
      const cachedArticles = JSON.parse(localStorage.getItem(CACHE_KEY));
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedArticles && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        setArticles(cachedArticles);
        setLoading(false);
      } else {
        await fetchArticles();
      }
    };

    loadArticles();
  }, []);

  return (
    <section className="mx-auto flex flex-col overflow-hidden">
      <div className="w-full sm:w-11/12 md:w-10/12 lg:w-10/12 xl:w-9/12 mx-auto">
        <p className="text-[#474F7A] text-[24px] font-bold mt-5 lg:mt-20 pl-4 lg:pl-2">ყველა სტატია</p>
        <button onClick={refreshArticles} className="mb-5 p-2 bg-[#AD88C6] text-white rounded">
          Refresh Articles
        </button>
        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {articles.map(article => (
              <Link href={`/sport-articles/${article.id}`} passHref key={article.id}>
                <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={article.acf.image || '/images/default-image.png'}
                      alt="article-cover"
                      layout="fill"
                      style={{ objectFit: "cover" }}
                      className="article-image"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-image.png'; }}
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
        )}
      </div>
    </section>
  );
};

export default AllArticlesPage;
