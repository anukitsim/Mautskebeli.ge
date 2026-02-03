'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Get YouTube thumbnail
const getThumbnailUrl = (videoId) => {
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

// Podcast Episode Item
const PodcastItem = ({ episode, index }) => {
  const thumbnailUrl = getThumbnailUrl(episode.id);
  const title = episode.snippet?.title || 'პოდკასტი';

  return (
    <Link 
      href={`/podcast?videoId=${episode.id}`} 
      className="group block"
    >
      <article 
        className="flex gap-3 p-2 rounded-lg hover:bg-[#EDE9F3] transition-all duration-300"
        style={{ 
          animationDelay: `${index * 80}ms`,
          animation: 'fadeSlideIn 0.5s ease-out forwards',
          opacity: 0
        }}
      >
        {/* Thumbnail with play icon */}
        <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#AD88C6] flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h3 className="text-[#474F7A] text-[11px] font-semibold leading-tight line-clamp-2 
                        group-hover:text-[#AD88C6] transition-colors duration-200">
            {title}
          </h3>
        </div>
      </article>
    </Link>
  );
};

// Podcast Sidebar Component
const JustInStrip = () => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const playlistId = 'PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy';
  const apiKey = 'AIzaSyDd4yHryI5WLPLNjpKsiuU1bYHnBgcK_u8';

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=6&playlistId=${playlistId}&key=${apiKey}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch podcasts');
        
        const data = await response.json();
        const podcastEpisodes = data.items.map((item) => ({
          id: item.snippet.resourceId.videoId,
          snippet: item.snippet,
        }));
        
        setEpisodes(podcastEpisodes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#FEFEFE] rounded-2xl shadow-[0_4px_24px_rgba(71,79,122,0.1)] border border-[#E8E4F0] p-4 h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-2 animate-pulse">
              <div className="w-20 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5 py-1">
                <div className="h-2.5 bg-gray-200 rounded w-full" />
                <div className="h-2.5 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#FEFEFE] rounded-2xl shadow-[0_4px_24px_rgba(71,79,122,0.1)] border border-[#E8E4F0] p-4 h-full flex flex-col">
      {/* Header with pulsing dot */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AD88C6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#AD88C6]"></span>
          </span>
          <h2 className="text-[#474F7A] text-base font-bold">პოდკასტი</h2>
        </div>
        <Link 
          href="/podcast" 
          className="text-[#AD88C6] text-xs font-semibold hover:underline"
        >
          ყველა →
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#E8E4F0] to-transparent mb-3" />

      {/* Podcast Episodes */}
      <div className="space-y-1 flex-1 overflow-y-auto">
        {episodes.map((episode, index) => (
          <PodcastItem key={episode.id} episode={episode} index={index} />
        ))}
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default JustInStrip;
