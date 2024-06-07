'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const PlayButton = ({ onClick }) => (
    <img
      src="/images/card-play-button.png"
      alt="playbutton"
      width={42}
      height={42}
      onClick={onClick}
      className="cursor-pointer transform hover:scale-110"
    />
  );
  
  const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };
  
  const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };
  
  const VideoCard = ({ videoId, caption, onSelect }) => {
    const thumbnailUrl = getThumbnailUrl(videoId);
  
    return (
      <div
        className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56"
        onClick={() => onSelect(videoId)}
      >
        <div
          className="relative w-full bg-cover bg-center rounded-lg"
          style={{ height: "70%" }}
        >
          <div
            style={{ backgroundImage: `url(${thumbnailUrl})`, height: "100%" }}
            className="w-full bg-cover bg-center rounded-lg"
          ></div>
          <div className="absolute inset-0 flex justify-center items-center">
            <PlayButton onClick={() => onSelect(videoId)} />
          </div>
        </div>
        <p className="text-white text-sm font-semibold">{caption}</p>
      </div>
    );
  };


const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <div className="sm:hidden z-50">
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="mr-7">
          <Image src="/images/search.png" alt="Search" width={25} height={25} />
        </button>
      </div>
      <div className={`${isSearchOpen ? "flex" : "hidden"} absolute top-full right-5 mt-1 mr-4 bg-white p-2 rounded-md shadow-lg z-40`}>
        <input
          type="text"
          placeholder="Search..."
          className="text-black outline-none px-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} type="submit" className="p-2">
          <Image src="/images/search.png" alt="Search" width={20} height={20} />
        </button>
      </div>
      <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2.5 bg-white rounded h-9 md:w-[340px]">
        <button type="submit" className="p-2 bg-white rounded-full">
          <Image src="/images/search.png" alt="Search" width={20} height={20} />
        </button>
        <input
          type="text"
          placeholder=""
          className="flex-1 px-4 text-[#474F7A] rounded-full border-none outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    </>
  );
};

export default Search;
