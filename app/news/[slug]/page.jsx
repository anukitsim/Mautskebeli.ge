'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import NewsVideoPlayer from '@/app/components/NewsVideoPlayer';

// Decode HTML entities
const decodeHTMLEntities = (str) => {
  if (typeof window === 'undefined') return str || '';
  if (!str) return '';
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
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

// Extract video ID from YouTube URL
const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

// Animation variants
const animations = {
  fadeInUp: {
    initial: { opacity: 0, transform: 'translateY(40px)' },
    animate: { opacity: 1, transform: 'translateY(0)' }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  scaleIn: {
    initial: { opacity: 0, transform: 'scale(0.95)' },
    animate: { opacity: 1, transform: 'scale(1)' }
  }
};

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef(null);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const article = articleRef.current;
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        const start = articleTop - windowHeight;
        const end = articleTop + articleHeight - windowHeight;
        const progress = Math.min(Math.max((scrollTop - start) / (end - start), 0), 1);
        
        setReadProgress(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      if (!params.slug) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/news?slug=${encodeURIComponent(params.slug)}&acf_format=standard`
        );
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
          setError('ახალი ამბავი ვერ მოიძებნა');
          setLoading(false);
          return;
        }
        
        const newsItem = data[0];
        
        if (newsItem.acf?.image && typeof newsItem.acf.image === 'number') {
          try {
            const mediaResponse = await fetch(
              `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/media/${newsItem.acf.image}`
            );
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              newsItem.acf.image = mediaData.source_url;
            }
          } catch (mediaError) {
            console.error('Error fetching image:', mediaError);
          }
        }
        
        setNews(newsItem);
        setLoading(false);
        // Trigger animations after a brief delay
        setTimeout(() => setIsLoaded(true), 100);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('მოხდა შეცდომა. სცადეთ თავიდან.');
        setLoading(false);
      }
    };

    fetchNews();
  }, [params.slug]);

  // Loading state with elegant skeleton
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero skeleton */}
        <div className="relative w-full h-[50vh] lg:h-[70vh] bg-gradient-to-br from-[#E8E0EE] to-[#D4C8DE] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-[#E8E0EE] rounded w-24" />
              <div className="h-10 bg-[#E8E0EE] rounded w-3/4" />
              <div className="h-10 bg-[#E8E0EE] rounded w-1/2" />
              <div className="flex gap-4">
                <div className="h-6 bg-[#E8E0EE] rounded w-20" />
                <div className="h-6 bg-[#E8E0EE] rounded w-32" />
              </div>
              <div className="h-px bg-[#E8E0EE]" />
              <div className="space-y-3">
                <div className="h-4 bg-[#E8E0EE] rounded w-full" />
                <div className="h-4 bg-[#E8E0EE] rounded w-full" />
                <div className="h-4 bg-[#E8E0EE] rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div 
          className="text-center max-w-md"
          style={{
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#AD88C6]/20 to-[#8C74B2]/20 
                        flex items-center justify-center">
            <svg className="w-12 h-12 text-[#AD88C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#474F7A] mb-4">{error}</h1>
          <p className="text-[#8B7AA0] mb-8">სამწუხაროდ, მოთხოვნილი ამბავი ვერ მოიძებნა</p>
          <Link 
            href="/news" 
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#AD88C6] to-[#8C74B2] 
                      text-white rounded-full font-medium shadow-lg shadow-[#AD88C6]/25
                      hover:shadow-xl hover:shadow-[#AD88C6]/30 hover:-translate-y-0.5
                      transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ყველა ამბავი
          </Link>
        </div>
      </div>
    );
  }

  if (!news) return null;

  const videoId = extractVideoId(news.acf?.video_url);
  const hasVideo = !!videoId;
  const hasImage = !!news.acf?.image;
  const title = decodeHTMLEntities(news.title?.rendered || news.title);

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent">
        <div 
          className="h-full bg-gradient-to-r from-[#AD88C6] via-[#9A75B3] to-[#8C74B2] transition-all duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <article ref={articleRef} className="min-h-screen pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] lg:h-[70vh] overflow-hidden">
          {/* Background Image */}
          {hasImage ? (
            <div className="absolute inset-0">
              <Image
                src={news.acf.image}
                alt={title}
                fill
                className="object-cover"
                priority
                style={{
                  transform: isLoaded ? 'scale(1)' : 'scale(1.1)',
                  transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#474F7A] via-[#474F7A]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#474F7A]/60 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#474F7A] via-[#5D6590] to-[#8C74B2]" />
          )}

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-6xl mx-auto w-full px-4 lg:px-8 pb-12 lg:pb-20">
              {/* Back Button */}
              <Link 
                href="/news" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6
                          transition-colors duration-300 text-sm font-medium backdrop-blur-sm
                          bg-white/10 rounded-full px-4 py-2 hover:bg-white/20"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ახალი ამბები
              </Link>


              {/* Title */}
              <h1 
                className="font-alk-tall-mtavruli text-[28px] sm:text-[42px] lg:text-[56px] xl:text-[64px] 
                          font-light leading-[1.1] text-white max-w-4xl drop-shadow-lg"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s'
                }}
              >
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 -mt-8 lg:-mt-16 relative z-10">
          <div 
            className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl shadow-[#474F7A]/10 overflow-hidden"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s'
            }}
          >
            {/* Meta Bar */}
            <div className="px-6 lg:px-10 py-5 lg:py-6 border-b border-[#E8E0EE] bg-gradient-to-r from-[#F6F4F8] to-white">
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-[#8B7AA0]">
                  <svg className="w-5 h-5 text-[#AD88C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="font-medium text-sm lg:text-base">{formatDate(news.date)}</span>
                </div>

                {/* Share Buttons - Desktop */}
                <div className="hidden lg:flex items-center gap-2 ml-auto">
                  <span className="text-xs text-[#8B7AA0] mr-2">გააზიარე:</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] 
                              hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 text-black 
                              hover:bg-black hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-6 lg:px-10 py-8 lg:py-10">
              {/* Description - Lead */}
              {news.acf?.description && (
                <div 
                  className="mb-8 lg:mb-10 relative pl-6 border-l-4 border-gradient"
                  style={{
                    borderImage: 'linear-gradient(180deg, #AD88C6 0%, #8C74B2 100%) 1'
                  }}
                >
                  <p className="text-[18px] lg:text-[22px] text-[#474F7A] leading-relaxed font-medium italic">
                    {news.acf.description}
                  </p>
                </div>
              )}

              {/* Video Player - Custom Purple Player */}
              {hasVideo && (
                <div className="mb-8 lg:mb-10">
                  <NewsVideoPlayer videoId={videoId} />
                </div>
              )}

              {/* Main Content */}
              {news.acf?.main_text && (
                <div 
                  className="article-content text-[#474F7A] font-noto-sans-georgian text-[16px] lg:text-[18px] 
                            font-normal leading-[1.9] lg:leading-[2] tracking-[0.2px]
                            prose prose-lg max-w-none
                            prose-headings:text-[#474F7A] prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                            prose-p:text-[#474F7A] prose-p:mb-6
                            prose-a:text-[#AD88C6] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-[#474F7A] prose-strong:font-bold
                            prose-ul:text-[#474F7A] prose-ol:text-[#474F7A]
                            prose-li:mb-2
                            prose-blockquote:border-l-4 prose-blockquote:border-[#AD88C6] prose-blockquote:bg-[#F6F4F8] 
                            prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8
                            prose-blockquote:text-[#8B7AA0] prose-blockquote:italic prose-blockquote:not-italic
                            [&>div]:mb-6"
                  dangerouslySetInnerHTML={{ __html: news.acf.main_text }}
                />
              )}

              {/* Tags */}
              {news.acf?.tags && news.acf.tags.trim() !== '' && (
                <div className="mt-10 pt-8 border-t border-[#E8E0EE]">
                  <div className="flex flex-wrap items-center gap-3">
                    <svg className="w-5 h-5 text-[#AD88C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {news.acf.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-[#F6F4F8] rounded-full text-sm text-[#8B7AA0] 
                                  border border-transparent hover:border-[#AD88C6] hover:text-[#AD88C6]
                                  transition-all duration-300 cursor-pointer"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Share Section */}
              <div className="lg:hidden mt-10 pt-8 border-t border-[#E8E0EE]">
                <p className="text-sm text-[#8B7AA0] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#AD88C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                  გააზიარე სოციალურ ქსელში
                </p>
                <div className="flex gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1877F2] text-white 
                              font-medium text-sm hover:bg-[#1565D8] transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white 
                              font-medium text-sm hover:bg-gray-800 transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X / Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Back to News CTA */}
          <div 
            className="mt-12 text-center"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s'
            }}
          >
            <Link 
              href="/news" 
              className="group inline-flex items-center gap-3 px-8 py-4 
                        bg-gradient-to-r from-[#AD88C6] to-[#8C74B2] text-white rounded-full 
                        font-medium shadow-lg shadow-[#AD88C6]/25
                        hover:shadow-xl hover:shadow-[#AD88C6]/30 hover:-translate-y-1
                        transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ყველა ამბავი
            </Link>
          </div>
        </div>
      </article>

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
