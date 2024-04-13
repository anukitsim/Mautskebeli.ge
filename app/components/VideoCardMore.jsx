"use client";
import React from 'react';

const PlayButton = () => (
  <img src='/images/playbuttontest.svg' alt='play button' width={70} height={70} />
);

const VideoCardMore = ({ videoId, caption }) => {
  // Remove any additional query parameters from videoId
  const sanitizedVideoId = videoId ? videoId.split('&')[0] : '';
  // Construct the thumbnail URL using the hqdefault.jpg quality
  const thumbnailUrl = `https://img.youtube.com/vi/${sanitizedVideoId}/hqdefault.jpg`;
  // Construct the YouTube video URL
  const videoUrl = `https://www.youtube.com/watch?v=${sanitizedVideoId}`;

  return (
    <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div
        style={{
          position: 'relative',
          width: '120px', 
          height: '120px',
          borderRadius: '10px',
          overflow: 'hidden',
          zIndex: 1,
        }}
        className='flex flex-col'
      >
        <img
          src={thumbnailUrl}
          alt="Video Thumbnail"
          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
          className='mt-[10px] '
        />
      
      </div>
    </a>
  );
};

export default VideoCardMore;
