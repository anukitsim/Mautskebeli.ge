"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
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
          onClick={() => onSelectSlide(index)} // Call the function when a bullet is clicked
        />
      ))}
    </div>
  );
};


const MainNews = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isMenuOpen } = useMenu();

  const mobileSectionStyle = isMenuOpen ? 'top-[calc(32px+40%)]' : 'top-32';

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleImageClick = () => {
    nextSlide();
  };

  useEffect(() => {
    const fetchSlides = async () => {
      const response = await fetch('http://mautskebeli.local/wp-json/wp/v2/main?acf_format=standard&_fields=id,title,acf,date');
      const data = await response.json();
      // Assuming each item has a 'date' property
      
      const enrichedData = data.map(item => ({
        ...item,
      }));
      setSlides(enrichedData);
    };
    fetchSlides();
  }, []);

  const getTimeAgo = (date) => {
    // Get the time difference string in Georgian
    let timeAgoString = formatDistanceToNow(new Date(date), { locale: ka });
    
    // Replace the 'დაახლოებით' (approximately) part of the string if it exists
    timeAgoString = timeAgoString.replace('დაახლოებით ', '');
    
    // Return the modified string with 'წინ' (ago) if not already there
    if (!timeAgoString.includes('წინ')) {
      timeAgoString += 'ს წინ';
    }
    
    return timeAgoString;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!Array.isArray(slides) || slides.length <= 0) {
    return null; // or a loading indicator
  }

  return (
    <>
    <section className="lg:block sm:hidden relative w-full h-auto  rounded-[16px] bg-gradient-to-b from-black to-black via-transparent overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0  transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
        >
          <Image
            src={slide.acf.image}
            alt={slide.title.rendered}
            layout='fill'
            objectFit='cover'
            priority={index === currentSlide}
          />
          <div className="absolute bottom-5 left-5 text-white">
            <h2 className="text-[#FECE27] text-[20px] font-extrabold ">დღის მთავარი ამბები</h2>
            <p className="text-[#fff] lg:text-[72px] sm:text-[30px]">{slide.title.rendered}</p>
            <p>{getTimeAgo(slide.date)}</p>
          </div>

        </div>
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
    <section className={`lg:hidden absolute z-0 left-0 ${mobileSectionStyle} w-full bg-black h-[335px]`}>
    {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={handleImageClick}
          className={`absolute inset-0  transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
        >
          <Image
            src={slide.acf.image}
            alt={slide.title.rendered}
            layout='fill'
            objectFit='cover'
            priority={index === currentSlide}
          />
          <div className="absolute top-40 left-5 text-white">
            <h2 className="bg-[#FECE27] text-[#474F7A] rounded-[4px] pl-[8px] pr-[8px] pt-[4px] pb-[4px] text-[12px] font-extrabold ">დღის მთავარი ამბები</h2>
            <p className="text-[#fff] lg:text-[72px] mt-5 sm:text-[30px]">{slide.title.rendered}</p>
           
          </div>
          <BulletsNavigation slides={slides} currentSlide={currentSlide} onSelectSlide={selectSlide} />
        </div>
      ))}

    </section>
    </>
    
  );
};

export default MainNews;
