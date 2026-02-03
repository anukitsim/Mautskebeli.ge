'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

// Featured News Card (Large)
const FeaturedNewsCard = ({ news, isLoaded }) => {
  const imageUrl = news.acf?.image || '/images/default-image.png';
  const hasVideo = news.acf?.video_url;

  return (
    <Link href={`/news/${news.slug}`} className="group block h-full">
      <article 
        className="relative h-full min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden shadow-xl"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Background Image */}
        <Image
          src={imageUrl}
          alt={decodeHTMLEntities(news.title)}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          priority
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#474F7A] via-[#474F7A]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#474F7A]/60 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#AD88C6] 
                           backdrop-blur-sm shadow-lg shadow-[#AD88C6]/30">
              ამბები
            </span>
          </div>
          
          {/* Title */}
          <h2 className="font-alk-tall-mtavruli text-[28px] lg:text-[42px] font-light leading-tight text-white 
                        mb-4 drop-shadow-lg transition-transform duration-300 group-hover:translate-x-2">
            {decodeHTMLEntities(news.title)}
          </h2>
          
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            {news.acf?.author && (
              <span className="font-medium">{news.acf.author}</span>
            )}
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{formatDate(news.date)}</span>
          </div>
          
          {/* Read indicator */}
          <div className="mt-6 flex items-center gap-3 text-white group-hover:gap-4 transition-all duration-300">
            <span className="font-medium">წაიკითხე სრულად</span>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center
                          group-hover:bg-[#AD88C6] transition-all duration-300">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Side News Card (Small)
const SideNewsCard = ({ news, index, isLoaded }) => {
  const imageUrl = news.acf?.image || '/images/default-image.png';
  const hasVideo = news.acf?.video_url;

  return (
    <Link href={`/news/${news.slug}`} className="group block">
      <article 
        className="flex gap-4 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20
                  hover:bg-white hover:shadow-xl transition-all duration-300"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateX(0)' : 'translateX(30px)',
          transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index + 1) * 150}ms`
        }}
      >
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title)}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[#8B7AA0] text-xs mb-1">{formatDate(news.date)}</p>
          <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2 
                        group-hover:text-[#AD88C6] transition-colors duration-300">
            {decodeHTMLEntities(news.title)}
          </h3>
        </div>
      </article>
    </Link>
  );
};

// Regular News Card
const NewsCard = ({ news, index, isLoaded }) => {
  const imageUrl = news.acf?.image || '/images/default-image.png';
  const hasVideo = news.acf?.video_url;

  return (
    <Link href={`/news/${news.slug}`} className="group block h-full">
      <article 
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
                   transition-all duration-500 transform hover:-translate-y-2
                   border border-[#E8E0EE]/50 h-full flex flex-col"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`
        }}
      >
        {/* Image container */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={imageUrl}
            alt={decodeHTMLEntities(news.title)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#474F7A]/60 via-transparent to-transparent 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Play button on hover for videos */}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 
                          transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl
                            transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-6 h-6 text-[#AD88C6] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Date */}
          <div className="flex items-center gap-2 text-[#8B7AA0] text-xs mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{formatDate(news.date)}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-[#474F7A] text-lg font-bold leading-snug line-clamp-2 
                        transition-colors duration-300 group-hover:text-[#AD88C6] mb-3 flex-1">
            {decodeHTMLEntities(news.title)}
          </h3>


          {/* Read more indicator */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E0EE]">
            <span className="text-[#AD88C6] text-sm font-medium">წაიკითხე</span>
            <div className="w-8 h-8 rounded-full bg-[#F6F4F8] flex items-center justify-center
                          group-hover:bg-[#AD88C6] transition-all duration-300">
              <svg className="w-4 h-4 text-[#AD88C6] group-hover:text-white transition-colors duration-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gradient-to-r from-[#E8E0EE] via-[#F6F4F8] to-[#E8E0EE] rounded-2xl h-56 mb-4
                  bg-[length:200%_100%] animate-shimmer" />
    <div className="px-2">
      <div className="h-3 bg-[#E8E0EE] rounded w-24 mb-3" />
      <div className="h-5 bg-[#E8E0EE] rounded w-full mb-2" />
      <div className="h-5 bg-[#E8E0EE] rounded w-3/4 mb-4" />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#E8E0EE] rounded-full" />
        <div className="h-3 bg-[#E8E0EE] rounded w-20" />
      </div>
    </div>
  </div>
);

// Main News Page Component
export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setIsLoaded(false);
      try {
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/news?per_page=${itemsPerPage}&page=${currentPage}&_=${new Date().getTime()}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setNews(data.news || []);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
        // Trigger animations
        setTimeout(() => setIsLoaded(true), 100);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);

  // Get featured news (first item) and side news (next 3)
  const featuredNews = news[0];
  const sideNews = news.slice(1, 4);
  const restNews = news.slice(4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFAFC] to-white">
      {/* Animated Hero Header */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#474F7A] via-[#5D6590] to-[#8C74B2]"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                 backgroundSize: '32px 32px'
               }} 
          />
        </div>
        
        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#AD88C6]/20 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FECE27]/10 blur-3xl animate-float-delayed" />
        
        <div className="relative w-11/12 md:w-10/12 mx-auto py-16 lg:py-24">
          {/* Breadcrumb */}
          <nav 
            className="flex items-center gap-2 text-white/60 text-sm mb-6"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Link href="/" className="hover:text-white transition-colors">მთავარი</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">ამბები</span>
          </nav>
          
          {/* Title with yellow line below */}
          <div
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
            }}
          >
            <h1 className="font-alk-tall-mtavruli text-[36px] lg:text-[56px] font-light text-white mb-2 drop-shadow-lg">
              ამბები
            </h1>
            <div 
              className="h-1 bg-[#FECE27] rounded-full"
              style={{
                width: isLoaded ? '120px' : '0%',
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-11/12 md:w-10/12 mx-auto py-12 lg:py-16">
        {loading ? (
          <>
            {/* Featured Loading */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <div className="lg:col-span-2 animate-pulse">
                <div className="bg-gradient-to-r from-[#E8E0EE] via-[#F6F4F8] to-[#E8E0EE] rounded-2xl h-[400px] lg:h-[500px]
                              bg-[length:200%_100%]" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/50 animate-pulse">
                    <div className="w-24 h-24 bg-[#E8E0EE] rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-[#E8E0EE] rounded w-16 mb-2" />
                      <div className="h-4 bg-[#E8E0EE] rounded w-full mb-2" />
                      <div className="h-4 bg-[#E8E0EE] rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grid Loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {news.length > 0 ? (
              <>
                {/* Featured Section */}
                {featuredNews && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Featured Card */}
                    <div className="lg:col-span-2">
                      <FeaturedNewsCard news={featuredNews} isLoaded={isLoaded} />
                    </div>
                    
                    {/* Side News */}
                    {sideNews.length > 0 && (
                      <div className="space-y-4">
                        <h3 
                          className="text-[#474F7A] font-bold text-lg mb-4 flex items-center gap-2"
                          style={{
                            opacity: isLoaded ? 1 : 0,
                            transition: 'opacity 0.6s ease 0.3s'
                          }}
                        >
                          <span className="w-1 h-6 bg-[#AD88C6] rounded-full" />
                          უახლესი
                        </h3>
                        {sideNews.map((item, index) => (
                          <SideNewsCard key={item.id} news={item} index={index} isLoaded={isLoaded} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section Divider */}
                {restNews.length > 0 && (
                  <div 
                    className="flex items-center gap-4 mb-8"
                    style={{
                      opacity: isLoaded ? 1 : 0,
                      transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s'
                    }}
                  >
                    <h2 className="text-[#474F7A] font-bold text-xl flex items-center gap-3">
                      <span className="w-2 h-8 bg-gradient-to-b from-[#AD88C6] to-[#8C74B2] rounded-full" />
                      ყველა ამბები
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#E8E0EE] to-transparent" />
                  </div>
                )}

                {/* News Grid */}
                {restNews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {restNews.map((item, index) => (
                      <NewsCard key={item.id} news={item} index={index} isLoaded={isLoaded} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div 
                className="text-center py-20"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#AD88C6]/10 to-[#8C74B2]/10 
                              flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#AD88C6]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#474F7A] mb-8">სატესტო რეჟიმი</h2>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#AD88C6] to-[#8C74B2] 
                            text-white rounded-full font-medium shadow-lg shadow-[#AD88C6]/25
                            hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  მთავარ გვერდზე დაბრუნება
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div 
                className="flex justify-center items-center gap-3 mt-16"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s'
                }}
              >
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="group w-12 h-12 rounded-full bg-white border border-[#E8E0EE] text-[#474F7A] 
                           flex items-center justify-center shadow-sm
                           hover:bg-[#AD88C6] hover:text-white hover:border-[#AD88C6] hover:shadow-lg hover:shadow-[#AD88C6]/25
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#474F7A]
                           disabled:hover:border-[#E8E0EE] disabled:hover:shadow-sm
                           transition-all duration-300"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-2 px-4">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300
                          ${currentPage === pageNum 
                            ? 'bg-gradient-to-r from-[#AD88C6] to-[#8C74B2] text-white shadow-lg shadow-[#AD88C6]/30 scale-110' 
                            : 'bg-white border border-[#E8E0EE] text-[#474F7A] hover:border-[#AD88C6] hover:text-[#AD88C6]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="group w-12 h-12 rounded-full bg-white border border-[#E8E0EE] text-[#474F7A] 
                           flex items-center justify-center shadow-sm
                           hover:bg-[#AD88C6] hover:text-white hover:border-[#AD88C6] hover:shadow-lg hover:shadow-[#AD88C6]/25
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#474F7A]
                           disabled:hover:border-[#E8E0EE] disabled:hover:shadow-sm
                           transition-all duration-300"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-3deg);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
