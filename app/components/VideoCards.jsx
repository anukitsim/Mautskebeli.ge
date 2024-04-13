"use client"

import React, { useState, useEffect, useCallback } from 'react';

const VideoCards = () => {
  const [randomVideos, setRandomVideos] = useState([]);

  const fetchRandomVideos = async () => {
    try {
      const postTypes = ['mecniereba', 'medicina', 'msoflio', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
      const requests = postTypes.map((postType) =>
        fetch(`http://mautskebeli.local/wp-json/wp/v2/${postType}?per_page=4&orderby=date&order=desc`)
      );

      const responses = await Promise.all(requests);
      const allVideos = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) throw new Error(`Failed to fetch videos for ${response.url}`);
          return response.json();
        })
      ).then((videos) => videos.flat());

      // Sort and select videos
      const sortedVideos = allVideos.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
      setRandomVideos(sortedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchRandomVideos();
  }, []);

  const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="flex flex-wrap -mx-4">
      {randomVideos.map((video) => (
        <div key={video.id} className="p-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          <div className="flex flex-col items-start w-full h-full p-4 bg-white rounded-lg shadow">
            <img className="w-full rounded-md" src={`https://img.youtube.com/vi/${extractVideoId(video.link)}/0.jpg`} alt={video.title} />
            <p className="mt-2 text-lg font-semibold">{video.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoCards;
