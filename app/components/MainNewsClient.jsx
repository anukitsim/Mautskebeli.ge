'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMenu } from '../context/MenuContext';
import he from 'he';

const MainNewsClient = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);
  const { isMenuOpen } = useMenu();
  const mobileSectionStyle = isMenuOpen ? 'top-[calc(32px+40%)]' : 'top-32';

  // Autoplay interval (5 seconds)
  const AUTOPLAY_INTERVAL = 5000;

  // Construct URL for each slide
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

  // Navigation functions
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
    // Reset autoplay timer when manually navigating
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying && !isHovered) {
        autoPlayRef.current = setInterval(nextSlide, AUTOPLAY_INTERVAL);
      }
    }
  }, [isAutoPlaying, isHovered, nextSlide]);

  // Autoplay effect
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (!slides || slides.length === 0) {
    return <p>No main news available</p>;
  }

  return (
    <>
      {/* Desktop View */}
      <div className="lg:block sm:hidden w-full">
        <section 
          className="relative w-full h-full min-h-[420px] rounded-[20px] overflow-hidden
                     ring-1 ring-black/5 group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        {/* Slides */}
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute inset-0 ${
                index === currentSlide 
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0'
              }`}
            >
              {/* Image with sophisticated animation */}
              <div
                className={`absolute inset-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === currentSlide 
                    ? 'scale-100 translate-x-0' 
                    : index < currentSlide
                    ? 'scale-[1.02] -translate-x-[60px]'
                    : 'scale-[1.02] translate-x-[60px]'
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
                  className="transition-opacity duration-[1000ms]"
                />
              </div>
              
              {/* Gradient Overlay - More sophisticated */}
              <div className={`absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/85 via-[#1a1a2e]/30 to-transparent transition-opacity duration-[1400ms] ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} />
              {/* Subtle vignette */}
              <div className={`absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] transition-opacity duration-[1400ms] ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} />
              
              {/* Content Overlay - Left-aligned, professional positioning */}
              <div 
                className={`absolute bottom-0 left-0 right-0 px-8 lg:px-12 pb-10 lg:pb-12 pt-6 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === currentSlide 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: index === currentSlide ? '400ms' : '0ms'
                }}
              >
                <h2 
                  className={`text-[#FECE27] text-[15px] lg:text-[18px] font-bold mb-3 lg:mb-4 tracking-wider uppercase transition-all duration-700 ease-out ${
                    index === currentSlide 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: index === currentSlide ? '500ms' : '0ms'
                  }}
                >
                  მთავარი ამბები
                </h2>
                <h3 
                  className={`text-white tracking-normal font-alk-tall-mtavruli lg:text-[52px] md:text-[42px] text-[28px] font-light leading-[1.15] transition-all duration-800 ease-out pr-4 lg:pr-20 ${
                    index === currentSlide 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    transitionDelay: index === currentSlide ? '600ms' : '0ms'
                  }}
                >
                  {he.decode(slide.title)}
                </h3>
              </div>
            </div>
          </Link>
        ))}

        {/* Navigation Arrows - Perfectly Positioned (Natural Center, Visible but Subtle) */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          className="group absolute left-5 top-1/2 -translate-y-1/2 z-20 
                     w-12 h-12 rounded-full 
                     bg-gradient-to-br from-white/12 to-white/6 
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center 
                     transition-all duration-300 
                     hover:bg-gradient-to-br hover:from-[#AD88C6]/35 hover:to-[#AD88C6]/25
                     hover:border-[#AD88C6]/50 hover:scale-110 hover:shadow-xl hover:shadow-[#AD88C6]/25
                     active:scale-95
                     opacity-70 hover:opacity-100"
          aria-label="Previous slide"
        >
          <svg 
            className="w-5 h-5 text-white group-hover:text-[#AD88C6] transition-colors duration-300 ml-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          className="group absolute right-5 top-1/2 -translate-y-1/2 z-20 
                     w-12 h-12 rounded-full 
                     bg-gradient-to-br from-white/12 to-white/6 
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center 
                     transition-all duration-300 
                     hover:bg-gradient-to-br hover:from-[#AD88C6]/35 hover:to-[#AD88C6]/25
                     hover:border-[#AD88C6]/50 hover:scale-110 hover:shadow-xl hover:shadow-[#AD88C6]/25
                     active:scale-95
                     opacity-70 hover:opacity-100"
          aria-label="Next slide"
        >
          <svg 
            className="w-5 h-5 text-white group-hover:text-[#AD88C6] transition-colors duration-300 ml-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-[#FECE27] transition-all duration-300"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
        </section>

        {/* Dot Indicators - Below Banner, Centered */}
        <div className="w-full flex justify-center items-center mt-6 mb-2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.preventDefault(); goToSlide(index); }}
              className={`group transition-all duration-500 rounded-full ${
                index === currentSlide 
                  ? 'w-10 h-3 bg-gradient-to-r from-[#FECE27] to-[#FDD835] shadow-lg shadow-[#FECE27]/50 ring-2 ring-[#FECE27]/30' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-125 hover:ring-2 hover:ring-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <section
        className={`lg:hidden absolute z-0 left-0 ${mobileSectionStyle} w-full h-[335px]`}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute inset-0 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image with animation */}
              <div
                className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === currentSlide 
                    ? 'scale-100 translate-x-0' 
                    : index < currentSlide
                    ? 'scale-[1.02] -translate-x-[40px]'
                    : 'scale-[1.02] translate-x-[40px]'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={he.decode(slide.title)}
                  width={1920}
                  height={1080}
                  sizes="100vw"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  priority={index === 0}
                  quality={80}
                  className="transition-opacity duration-1000"
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} />
              
              <div className={`absolute bottom-0 w-full text-white p-4 z-20 transition-all duration-700 ease-out ${
                index === currentSlide 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: index === currentSlide ? '300ms' : '0ms'
              }}>
                <h2 className="text-[#FECE27] text-[12px] font-extrabold">
                  მთავარი ამბები
                </h2>
                <p className="text-white tracking-wider pt-2 font-alk-tall-mtavruli text-[24px] font-light leading-tight">
                  {he.decode(slide.title)
                    .split(' ')
                    .slice(0, 6)
                    .join(' ')}
                  {he.decode(slide.title).split(' ').length > 6 && '...'}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* Mobile Navigation Arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          className="group absolute left-3 top-1/2 -translate-y-1/2 z-30 
                     w-11 h-11 rounded-full 
                     bg-gradient-to-br from-white/20 to-white/10 
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center 
                     transition-all duration-300 
                     hover:bg-gradient-to-br hover:from-[#AD88C6]/30 hover:to-[#AD88C6]/20
                     hover:border-[#AD88C6]/40 hover:scale-110 active:scale-95
                     opacity-70 hover:opacity-100"
          aria-label="Previous slide"
        >
          <svg 
            className="w-5 h-5 text-white group-hover:text-[#AD88C6] transition-colors ml-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          className="group absolute right-3 top-1/2 -translate-y-1/2 z-30 
                     w-11 h-11 rounded-full 
                     bg-gradient-to-br from-white/20 to-white/10 
                     backdrop-blur-md border border-white/20
                     flex items-center justify-center 
                     transition-all duration-300 
                     hover:bg-gradient-to-br hover:from-[#AD88C6]/30 hover:to-[#AD88C6]/20
                     hover:border-[#AD88C6]/40 hover:scale-110 active:scale-95
                     opacity-70 hover:opacity-100"
          aria-label="Next slide"
        >
          <svg 
            className="w-5 h-5 text-white group-hover:text-[#AD88C6] transition-colors ml-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </section>

      {/* Mobile Dot Indicators - Below Banner, Centered */}
      <div className="lg:hidden w-full flex justify-center items-center mt-3 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.preventDefault(); goToSlide(index); }}
            className={`group transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'w-8 h-2.5 bg-gradient-to-r from-[#FECE27] to-[#FDD835] shadow-lg shadow-[#FECE27]/50 ring-2 ring-[#FECE27]/30' 
                : 'w-2.5 h-2.5 bg-gray-400 hover:bg-gray-500 hover:scale-125 hover:ring-2 hover:ring-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
};

export default MainNewsClient;
