'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Decode HTML entities
const decodeHTMLEntities = (str) => {
  if (typeof window === 'undefined') return str || '';
  if (!str) return '';
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
};

// Extract video ID from YouTube URL
const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

// Format date in Georgian
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// News Card Component - Bigger version for grid
const NewsCard = ({ news, index, featured = false }) => {
  const imageUrl = news.acf?.image || '/images/default-image.png';
  const hasVideo = news.acf?.video_url;
  
  // Construct the proper URL - news always goes to /news/[slug]
  const constructUrl = () => {
    return `/news/${news.slug}`;
  };

  if (featured) {
    // Featured card - larger, spans 2 columns on desktop
    return (
      <Link href={constructUrl()} className="group block lg:col-span-2 md:col-span-2">
        <article 
          className="relative h-[380px] rounded-2xl overflow-hidden shadow-lg"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'slideUp 0.6s ease-out forwards',
            opacity: 0
          }}
        >
          {/* Image with zoom effect */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={decodeHTMLEntities(news.title)}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority={index === 0}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            {/* Date */}
            <p className="text-white/60 text-sm mb-2">{formatDate(news.date)}</p>

            {/* Title */}
            <h3 className="text-white text-2xl lg:text-3xl font-bold leading-tight mb-2 
                          line-clamp-3 transition-colors duration-300 group-hover:text-[#FECE27]">
              {decodeHTMLEntities(news.title)}
            </h3>

            {/* Read more */}
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium 
                           opacity-0 transform translate-y-2 group-hover:opacity-100 
                           group-hover:translate-y-0 transition-all duration-300">
              <span>წაიკითხე მეტი</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Hover indicator line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FECE27] 
                         transform scale-x-0 group-hover:scale-x-100 
                         transition-transform duration-500 origin-left z-20" />
        </article>
      </Link>
    );
  }

  // Standard card
  return (
    <Link href={constructUrl()} className="group block">
      <article 
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl 
                   transition-all duration-500 transform hover:-translate-y-2
                   border border-[#E0DBE8]/30 h-full"
        style={{ 
          animationDelay: `${index * 100}ms`,
          animation: 'slideUp 0.6s ease-out forwards',
          opacity: 0
        }}
      >
        {/* Image container */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 
                         group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Date */}
          <p className="text-[#8B7AA0] text-xs mb-2">{formatDate(news.date)}</p>
          
          {/* Title */}
          <h3 className="text-[#474F7A] text-lg font-bold leading-snug line-clamp-2 
                        transition-colors duration-300 group-hover:text-[#AD88C6] mb-2">
            {decodeHTMLEntities(news.title)}
          </h3>

          {/* Read more indicator */}
          <div className="flex items-center gap-2 text-[#AD88C6] text-sm font-medium 
                         opacity-0 transform translate-x-[-10px] group-hover:opacity-100 
                         group-hover:translate-x-0 transition-all duration-300">
            <span>წაიკითხე</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Main News Section Component
const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/news?per_page=6&_=${new Date().getTime()}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setNews(data.news || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-[#E0DBE8] rounded w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 md:col-span-2 bg-[#E0DBE8] rounded-2xl h-[380px]" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#E0DBE8] rounded-xl h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredNews = news.slice(0, 1);
  const regularNews = news.slice(1, 5);

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-[#AD88C6] rounded-full" />
          <h2 className="text-[#474F7A] text-2xl lg:text-3xl font-bold">ახალი ამბები</h2>
        </div>
        <Link 
          href="/news" 
          className="text-[#474F7A] text-sm font-semibold hover:text-[#AD88C6] 
                     transition-colors duration-300 flex items-center gap-2 group"
        >
          <span>ნახე ყველა</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* News Grid: 1 Featured (2 cols) + 4 Regular */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Featured Card - spans 2 columns */}
        {featuredNews.map((item, index) => (
          <NewsCard key={item.id} news={item} index={index} featured />
        ))}

        {/* Regular Cards */}
        {regularNews.map((item, index) => (
          <NewsCard key={item.id} news={item} index={index + 1} />
        ))}
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default NewsSection;
