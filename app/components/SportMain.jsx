'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMenu } from '../context/MenuContext';

const BulletsNavigation = ({ slides, currentSlide, onSelectSlide }) => {
  return (
    <div className="sm:hidden flex justify-center items-center absolute bottom-0 left-0 right-0 pb-4">
      {slides.map((_, index) => (
        <button
          key={index}
          className={`mx-1 h-2 w-2 rounded-full cursor-pointer ${
            currentSlide === index ? 'bg-[#AD88C6]' : 'bg-white'
          }`}
          onClick={() => onSelectSlide(index)}
        />
      ))}
    </div>
  );
};

const SportMain = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isMenuOpen } = useMenu();
  const mobileSectionStyle = isMenuOpen ? 'top-[calc(32px+40%)]' : 'top-32';

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const fetchSlides = async () => {
      const response = await fetch(
        'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/main?acf_format=standard&_fields=id,title,acf,date'
      );
      const data = await response.json();
      setSlides(data);
    };
    fetchSlides();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!Array.isArray(slides) || slides.length <= 0) {
    return null;
  }

  return (
    <>
      <section className="lg:block sm:hidden relative w-full h-[468px]  rounded-[16px] bg-gradient-to-b from-black to-black via-transparent overflow-hidden">
        {slides.map((slide, index) => (
          <Link href={`/${slide.id}`} key={slide.id}>
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.acf.image}
                alt={slide.title.rendered}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={index === currentSlide}
                loading={index === currentSlide ? 'eager' : 'lazy'}
              />
              <div className="absolute bottom-5 left-5 text-white">
                <h2 className="text-[#FECE27] text-[20px] font-extrabold">
                  დღის მთავარი ამბები
                </h2>
                <p className="text-[#fff] lg:text-[72px] sm:text-[30px]">
                  {slide.title.rendered.split(' ').slice(0, 7).join(' ')}
                  {slide.title.rendered.split(' ').length > 7 && '...'}
                </p>
              </div>
            </div>
          </Link>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image src="/images/arrow-left.png" alt="Previous" width={50} height={50} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image src="/images/arrow-right.png" alt="Next" width={50} height={50} />
        </button>
      </section>
      <section
        className={`lg:hidden absolute z-0 left-0 ${mobileSectionStyle} w-full bg-black h-[335px]`}
      >
        {slides.map((slide, index) => (
          <Link href={`/${slide.id}`} key={slide.id}>
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.acf.image}
                alt={slide.title.rendered}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority={index === currentSlide}
                loading={index === currentSlide ? 'eager' : 'lazy'}
                quality={100}
              />
              <div className="absolute top-48 left-24 text-white">
                <h2 className="bg-[#FECE27] text-[#474F7A] rounded-[4px] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-extrabold">
                  დღის მთავარი ამბები
                </h2>
                <p className="text-[#fff] lg:text-[72px] mt-5 sm:text-[30px]">
                  {slide.title.rendered.split(' ').slice(0, 7).join(' ')}
                  {slide.title.rendered.split(' ').length > 7 && '...'}
                </p>
              </div>
              <BulletsNavigation slides={slides} currentSlide={currentSlide} onSelectSlide={selectSlide} />
            </div>
          </Link>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image src="/images/arrow-left.png" alt="Previous" width={50} height={50} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image src="/images/arrow-right.png" alt="Next" width={50} height={50} />
        </button>
      </section>
    </>
  );
};

export default SportMain;
