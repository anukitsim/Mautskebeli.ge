"use client";

import React, { useEffect, useState } from 'react';
import VideoCardMore from './VideoCardMore';

const MoreVideos = () => {
  const [randomVideos, setRandomVideos] = useState([]);

  // Shuffle the array of videos
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  };

  // Fetch random videos from the server
  const fetchRandomVideos = async () => {
    try {
      const postTypes = ['mecniereba', 'medicina', 'msoflio', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
      const allVideos = [];
  
      for (const postType of postTypes) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}?per_page=4&orderby=date&order=desc`
        );
        
  
        if (!response.ok) {
          throw new Error(`Error fetching videos for ${postType}: ${response.statusText}`);
        }
  
        const data = await response.json();
        allVideos.push(...data);
      }
  
      shuffleArray(allVideos); // Shuffle the array to randomize
      const selectedRandomVideos = allVideos.slice(0, 4); // Take first four videos
      setRandomVideos(selectedRandomVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchRandomVideos();
  }, []); // Empty dependency array to run only once on mount

  const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className='w-11/12 mx-auto lg:block hidden'>
      <div className="flex flex-wrap justify-center gap-[6px]">
        {randomVideos.map((video, index) => (
          <VideoCardMore
            key={index}
            videoId={extractVideoId(video.acf.video_url)}
            caption={video.title.rendered}
          />
        ))}
      </div>
    </div>
  );
};

export default MoreVideos;
