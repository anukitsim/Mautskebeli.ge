"use client";
import React from 'react';

const VideoCardMore = ({ videoId, caption }) => {
  const sanitizedVideoId = videoId ? videoId.split('&')[0] : '';
  const thumbnailUrl = `https://img.youtube.com/vi/${sanitizedVideoId}/hqdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${sanitizedVideoId}`;

  return (
    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
     <div
      className="relative flex flex-col items-center w-full max-w-[176px] p-2.5 gap-2 mx-auto my-2 bg-[#AD88C6] rounded-lg cursor-pointer"
      style={{ height: '143px' }} // Fixed height for all cards
     
    >
       <div
        className="w-full h-40 bg-cover bg-center rounded-lg"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      >
        </div>
        {/* Caption overlay */}
        <p className="text-sm font-semibold text-center text-white truncate w-full px-2" style={{ height: '50px' }}>
        {caption} // Safe access to title with default
      </p>
      </div>
    </a>
  );
};

export default VideoCardMore;
