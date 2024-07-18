'use client'
import Image from 'next/image';
import React, { useState } from 'react';

const AlbumSlider = ({ message, post }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex + 1) % post.attachments.data[0].subattachments.data.length
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + post.attachments.data[0].subattachments.data.length) %
        post.attachments.data[0].subattachments.data.length
    );
  };

  const handleBulletClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden" style={{ minHeight: '600px' }}>
        {post.attachments.data[0].subattachments.data.map((image, index) => (
          <img
            key={index}
            src={image.media.image.src}
            alt={`Slide ${index}`}
            className={`absolute transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ))}
        <div className="absolute w-full flex justify-between items-center px-4">
          <Image
            src="/images/arrow-left.svg"
            alt="left arrow"
            width={56}
            height={56}
            onClick={handlePrevImage}
            className="cursor-pointer"
          />
          <Image
            src="/images/arrow-right.svg"
            alt="right arrow"
            width={56}
            height={56}
            onClick={handleNextImage}
            className="cursor-pointer"
          />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        {post.attachments.data[0].subattachments.data.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentImageIndex ? "bg-[#8C74B2]" : "bg-[#E0DBE8]"}`}
            onClick={() => handleBulletClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AlbumSlider;
