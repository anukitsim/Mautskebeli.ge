'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Category color mapping
const categoryColors = {
  'msoflio': { bg: '#1E3A5F', label: 'მსოფლიო' },
  'ekonomika': { bg: '#2D5A27', label: 'ეკონომიკა' },
  'mecniereba': { bg: '#5B2C6F', label: 'მეცნიერება' },
  'medicina': { bg: '#C0392B', label: 'მედიცინა' },
  'xelovneba': { bg: '#D35400', label: 'ხელოვნება' },
  'kalaki': { bg: '#1ABC9C', label: 'ქალაქი' },
  'shroma': { bg: '#E74C3C', label: 'შრომა' },
  'resursebi': { bg: '#3498DB', label: 'რესურსები' },
  'saxli': { bg: '#9B59B6', label: 'სახლი ყველას' },
  'article': { bg: '#474F7A', label: 'სტატია' },
  'default': { bg: '#474F7A', label: 'სიახლე' }
};

// Decode HTML entities
const decodeHTMLEntities = (str) => {
  if (typeof window === 'undefined') return str || '';
  if (!str) return '';
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
};

// Breaking News Item Component
const BreakingNewsItem = ({ news, index, isFirst = false }) => {
  const category = categoryColors[news.post_type] || categoryColors.default;
  const imageUrl = news.image || news.acf?.image || '/images/default-image.png';
  
  const constructUrl = () => {
    if (news.videoId) {
      return `/${news.post_type}?videoId=${news.videoId}`;
    }
    if (news.post_type === 'article') {
      return news.slug ? `/all-articles/${news.slug}` : `/all-articles/${news.id}`;
    }
    return `/${news.post_type}/${news.id}`;
  };

  // First item is larger/featured
  if (isFirst) {
    return (
      <Link href={constructUrl()} className="group block">
        <article 
          className="relative h-[200px] rounded-xl overflow-hidden"
          style={{ 
            animationDelay: `${index * 80}ms`,
            animation: 'fadeSlideIn 0.5s ease-out forwards',
            opacity: 0
          }}
        >
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title?.rendered || news.title)}
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/90 via-[#1a1a2e]/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span 
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold text-white mb-2 
                         shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: category.bg }}
            >
              {category.label}
            </span>
            <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 
                          group-hover:text-[#FECE27] transition-colors duration-300">
              {decodeHTMLEntities(news.title?.rendered || news.title)}
            </h3>
          </div>
        </article>
      </Link>
    );
  }

  // Regular compact items
  return (
    <Link href={constructUrl()} className="group block">
      <article 
        className="flex gap-3 p-2 rounded-lg hover:bg-[#EDE9F3] transition-all duration-300"
        style={{ 
          animationDelay: `${index * 80}ms`,
          animation: 'fadeSlideIn 0.5s ease-out forwards',
          opacity: 0
        }}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title?.rendered || news.title)}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        {/* Content */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span 
            className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full self-start mb-1"
            style={{ backgroundColor: category.bg }}
          >
            {category.label}
          </span>
          <h3 className="text-[#474F7A] text-xs font-semibold leading-tight line-clamp-2 
                        group-hover:text-[#AD88C6] transition-colors duration-200">
            {decodeHTMLEntities(news.title?.rendered || news.title)}
          </h3>
        </div>
      </article>
    </Link>
  );
};

// Main News Section Component - Breaking News Sidebar Style
const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/main-posts?_=${new Date().getTime()}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        let data = await response.json();
        setNews(data.slice(0, 6)); // Take 6 items
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
      <div className="bg-[#FEFEFE] rounded-2xl shadow-[0_4px_24px_rgba(71,79,122,0.1)] border border-[#E8E4F0] p-4 h-full">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        {/* Featured skeleton */}
        <div className="h-[200px] bg-gray-200 rounded-xl mb-4 animate-pulse" />
        {/* Items skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-20 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-200 rounded w-12" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const featuredNews = news[0];
  const otherNews = news.slice(1, 6);

  return (
    <section className="bg-[#FEFEFE] rounded-2xl shadow-[0_4px_24px_rgba(71,79,122,0.1)] border border-[#E8E4F0] p-4 h-full flex flex-col">
      {/* Header - Breaking News Style */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Pulsing red dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <h2 className="text-[#474F7A] text-lg font-bold">სიახლეები</h2>
        </div>
        <Link 
          href="/all-articles" 
          className="text-[#AD88C6] text-xs font-semibold hover:underline transition-all"
        >
          ყველა →
        </Link>
      </div>

      {/* Featured News Item */}
      {featuredNews && (
        <div className="mb-4">
          <BreakingNewsItem news={featuredNews} index={0} isFirst />
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#E8E4F0] to-transparent mb-3" />

      {/* Other News Items */}
      <div className="space-y-1 flex-1">
        {otherNews.map((item, index) => (
          <BreakingNewsItem key={item.id || index} news={item} index={index + 1} />
        ))}
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default NewsSection;
