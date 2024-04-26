'use client'
import Image from 'next/image';
import React, { useState } from 'react'

const AlbumSlider = ({message,post}) => {
    const [currentImageIndex,setCurrentImageIndex] = useState(0);

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
    <div className="pb-10">
    <div className="flex flex-row-reverse w-11/12 mx-auto mt-10 items-center gap-10">
      <div className="w-6/12">
        {message && <h1 className="">{message}</h1>}
      </div>

      {/* Render a gallery of images for "album" type */}
      {post?.attachments && post?.attachments?.data[0]?.type === "album" && (
        <div
          className="w-6/12 h-[443px] border flex p-6 justify-center border-[#E0DBE8] rounded-[6px]"
          style={{
            backgroundImage: `url(${
              post.attachments.data[0].subattachments.data[
                currentImageIndex
              ]?.media?.image?.src || ""
            })`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-row justify-between w-full items-center mb-4">
            <Image
              src="/images/arrow-left.png"
              alt="left arrow"
              width={56}
              height={56}
              onClick={handlePrevImage}
              className="cursor-pointer"
            />
            <Image
              src="/images/arrow-right.png"
              alt="right arrow"
              width={56}
              height={56}
              onClick={handleNextImage}
              className="cursor-pointer ml-4"
            />
          </div>
        </div>
      )}

      {/* Render additional content here */}
    </div>
    <div className="flex space-x-2 mt-5 w-6/12 justify-center">
      {post.attachments.data[0].subattachments.data.map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300 ${
            index === currentImageIndex ? "bg-[#8C74B2]" : "bg-[#E0DBE8]"
          }`}
          onClick={() => handleBulletClick(index)}
        />
      ))}
    </div>
  </div>
  )
}

export default AlbumSlider
