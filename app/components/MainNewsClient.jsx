// app/components/MainNewsClient.js (Client Component)

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMenu } from '../context/MenuContext'; // Adjust the path as necessary

const MainNewsClient = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isMenuOpen } = useMenu(); // If you need this context
  const mobileSectionStyle = isMenuOpen ? 'top-[calc(32px+40%)]' : 'top-32';

  // Define constructUrl function here
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

  // Keyboard navigation event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    // Attach the event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, slides.length]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  if (!slides || slides.length === 0) {
    return <p>No main news available</p>;
  }

  return (
    <>
      {/* Desktop View */}
      <section className="lg:block sm:hidden relative w-full h-auto rounded-[16px] overflow-hidden">
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                layout="fill"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0} // Preload the first image
                quality={80}
              />
              <div className="absolute bottom-5 bg-[#474F7A] bg-opacity-50 w-full text-white">
                <h2 className="text-[#FECE27] pl-5 text-[20px] font-extrabold">
                  მთავარი ამბები
                </h2>
                <p className="text-[#FFF] pl-5 tracking-normal pt-[10px] font-alk-tall-mtavruli lg:text-[72px] sm:text-[30px] font-light leading-none [text-edge:cap] [leading-trim:both]">
                  {slide.title.split(' ').slice(0, 7).join(' ')}
                  {slide.title.split(' ').length > 7 && '...'}
                </p>
              </div>
            </div>
          </Link>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image
            src="/images/arrow-left.svg"
            alt="Previous"
            width={50}
            height={50}
          />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image
            src="/images/arrow-right.svg"
            alt="Next"
            width={50}
            height={50}
          />
        </button>
      </section>

      {/* Mobile View */}
      <section
        className={`lg:hidden absolute z-0 left-0 ${mobileSectionStyle} w-full h-[335px]`}
      >
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={1080}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0}
                quality={80}
                layout="responsive"
              />
              <div className="absolute bottom-0 bg-[#474F7A] bg-opacity-50 w-full text-white z-20">
                <h2 className="text-[#FECE27] pl-5 text-[10px] pt-2 font-extrabold">
                  მთავარი ამბები
                </h2>
                <p className="text-[#FFF] pl-5 tracking-wider pt-[10px] pb-5 font-alk-tall-mtavruli sm:text-[100px] font-light leading-6 [text-edge:cap] [leading-trim:both]">
                  {slide.title.split(' ').slice(0, 7).join(' ')}
                  {slide.title.split(' ').length > 7 && '...'}
                </p>
              </div>
            </div>
          </Link>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-5 top-[25%] -translate-y-1/2 z-30"
        >
          <Image
            src="/images/arrow-left.svg"
            alt="Previous"
            width={50}
            height={50}
          />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-[25%] -translate-y-1/2 z-30"
        >
          <Image
            src="/images/arrow-right.svg"
            alt="Next"
            width={50}
            height={50}
          />
        </button>
      </section>
    </>
  );
};

export default MainNewsClient;
