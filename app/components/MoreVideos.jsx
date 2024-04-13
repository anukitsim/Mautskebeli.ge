"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import VideoCardMore from './VideoCardMore';

const MoreVideos = () => {
  const [randomVideos, setRandomVideos] = useState([]);

  const fetchRandomVideos = async () => {
    try {
      const postTypes = ['mecniereba', 'medicina', 'msoflio', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
      const allVideos = [];
  
      // Fetch videos for each post type
      for (const postType of postTypes) {
        const response = await fetch(
          `http://mautskebeli.local/wp-json/wp/v2/${postType}?per_page=4&orderby=date&order=desc`
        );
  
        if (!response.ok) {
          console.error(`Error fetching videos for ${postType}:`, response.statusText);
          continue; // Continue with the next post type on error
        }
  
        const data = await response.json();
        allVideos.push(...data);
      }
  
      // Sort all videos by date in descending order
      const sortedVideos = allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
  
      // Select the first 4 videos
      const selectedRandomVideos = sortedVideos.slice(0, 4);
  
      setRandomVideos(selectedRandomVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };
  
  

  const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchRandomVideos();
  }, []);

  return (
    <div className='w-11/12 mx-auto '>
      <div className="flex flex-wrap justify-center gap-10">
        {randomVideos.map((video, index) => (
          <div key={index} className=" flex flex-row ">
            <VideoCardMore
              videoId={extractVideoId(video.acf.video_url)}
              caption={video.title.rendered}
            
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreVideos;
