'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import he from 'he';

const MainNewsClient = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);

  const AUTOPLAY_INTERVAL = 5000;

  const constructUrl = (post) => {
    const { id, post_type, videoId } = post;
    if (videoId) {
      return `/${post_type}?videoId=${videoId}`;
    }
    switch (post_type) {
      case 'article':
        return `/all-articles/${id}`;
      case 'mau-books':
        return `/books/${id}`;
      default:
        return `/${post_type}/${id}`;
    }
  };

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying && !isHovered) {
        autoPlayRef.current = setInterval(nextSlide, AUTOPLAY_INTERVAL);
      }
    }
  }, [isAutoPlaying, isHovered, nextSlide]);

  useEffect(() => {
    if (isAutoPlaying && !isHovered && slides.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, nextSlide, slides.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') prevSlide();
      else if (event.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (!slides || slides.length === 0) {
    return <p>No main news available</p>;
  }

  return (
    <div
      className="w-full h-full"
      style={{ animation: 'slideUp 0.6s ease-out forwards', opacity: 0 }}
    >
      <section
        className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] lg:h-full lg:min-h-[420px] rounded-[16px] lg:rounded-[20px] overflow-hidden ring-1 ring-black/5 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div
                className={`absolute inset-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === currentSlide
                    ? 'scale-100 translate-x-0'
                    : index < currentSlide
                    ? 'scale-[1.02] -translate-x-[40px] lg:-translate-x-[60px]'
                    : 'scale-[1.02] translate-x-[40px] lg:translate-x-[60px]'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={he.decode(slide.title)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  style={{ objectFit: 'cover' }}
                  priority={index === 0}
                  quality={85}
                />
              </div>

              <div className={`absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/85 via-[#1a1a2e]/30 to-transparent transition-opacity duration-[1400ms] ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} />
              <div className={`absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] lg:shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] transition-opacity duration-[1400ms] ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} />

              <div
                className={`absolute bottom-0 left-0 right-0 px-5 sm:px-6 lg:px-12 pb-12 sm:pb-10 lg:pb-12 pt-6 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: index === currentSlide ? '400ms' : '0ms' }}
              >
                <h3
                  className={`text-white tracking-normal font-alk-tall-mtavruli text-[22px] sm:text-[28px] md:text-[36px] lg:text-[48px] xl:text-[52px] font-light leading-[1.15] transition-all duration-800 ease-out pr-2 sm:pr-4 lg:pr-20 ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: index === currentSlide ? '600ms' : '0ms' }}
                >
                  {he.decode(slide.title)}
                </h3>
              </div>
            </div>
          </Link>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          className="group absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 lg:w-12 lg:h-12 rounded-full
                     bg-gradient-to-br from-white/15 to-white/5
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center
                     transition-all duration-300
                     hover:from-[#AD88C6]/35 hover:to-[#AD88C6]/25
                     hover:border-[#AD88C6]/50 hover:scale-110
                     active:scale-95 opacity-70 hover:opacity-100"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          className="group absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 lg:w-12 lg:h-12 rounded-full
                     bg-gradient-to-br from-white/15 to-white/5
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center
                     transition-all duration-300
                     hover:from-[#AD88C6]/35 hover:to-[#AD88C6]/25
                     hover:border-[#AD88C6]/50 hover:scale-110
                     active:scale-95 opacity-70 hover:opacity-100"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators - inside banner */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-2 sm:gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.preventDefault(); goToSlide(index); }}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-[#FECE27] to-[#FDD835] shadow-lg shadow-[#FECE27]/40'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70 hover:scale-125'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainNewsClient;
