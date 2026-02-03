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

// Compact News Card for Sidebar - MUST be defined before NewsSection uses it
const CompactNewsCard = ({ news, index }) => {
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

  return (
    <Link href={constructUrl()} className="group block">
      <article 
        className="flex gap-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-300"
        style={{ 
          animationDelay: `${index * 80}ms`,
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0
        }}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title?.rendered || news.title)}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Category dot */}
          <div 
            className="absolute bottom-1 left-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: category.bg }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category label */}
          <span 
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: category.bg }}
          >
            {category.label}
          </span>
          
          {/* Title */}
          <h3 className="text-[#222] text-sm font-medium leading-tight line-clamp-2 
                        group-hover:text-[#AD88C6] transition-colors duration-300">
            {decodeHTMLEntities(news.title?.rendered || news.title)}
          </h3>
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
        // Fetch from the main-posts endpoint (same as MainNews)
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/main-posts?_=${new Date().getTime()}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        let data = await response.json();
        
        // Sort by date and take latest 5
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(data.slice(0, 5));
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
      <div className="w-full h-full p-4 rounded-[16px] border border-[#E0DBE8] bg-[rgba(224,219,232,0.20)]"
           style={{ boxShadow: '4px 4px 12px rgba(93, 78, 116, 0.14)' }}>
        <div className="animate-pulse">
          <div className="h-6 bg-[#E0DBE8] rounded w-24 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#E0DBE8] rounded-lg h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full h-full p-4 rounded-[16px] border border-[#E0DBE8] bg-[rgba(224,219,232,0.20)]"
           style={{ boxShadow: '4px 4px 12px rgba(93, 78, 116, 0.14)' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FECE27] rounded-full" />
          <h2 className="text-[#474F7A] text-lg font-bold">სიახლეები</h2>
        </div>
        <Link 
          href="/all-videos" 
          className="text-[#AD88C6] text-xs font-semibold hover:text-[#474F7A] 
                     transition-colors duration-300"
        >
          ყველა
        </Link>
      </div>

      {/* Compact News Cards - Vertical Stack */}
      <div className="space-y-3">
        {news.map((item, index) => (
          <CompactNewsCard key={item.id} news={item} index={index} />
        ))}
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default NewsSection;
