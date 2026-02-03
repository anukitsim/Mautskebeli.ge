'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { decode } from 'html-entities';

const videoPostTypes = [
  "kalaki",
  "mecniereba",
  "medicina",
  "msoflio",
  "saxli",
  "shroma",
  "xelovneba",
];

const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const constructUrl = (post) => {
  const { post_id, post_type, acf_fields } = post;
  const videoId = extractVideoId(acf_fields.video_url);

  if (videoId) {
    return `/${post_type}?videoId=${videoId}`;
  }

  return `/all-articles/${post_id}`;
};

const HomePageRcheuli = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/acf-fields?cacheBuster=${cacheBuster}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Data:', data);

        const filteredAndSortedPosts = data
          .filter(post => post.acf_fields.rcheuli)
          .filter(post => !['sporti-videos', 'sporti'].includes(post.post_type))
          .sort((a, b) => new Date(b.modified) - new Date(a.modified))
          .slice(0, 4);

        setPosts(filteredAndSortedPosts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPosts();
  }, []);

  const getMediaThumbnail = (post) => {
    if (post.acf_fields.video_url) {
      const videoIdMatch = extractVideoId(post.acf_fields.video_url);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch}/hqdefault.jpg`;
      }
      console.error('Invalid YouTube URL:', post.acf_fields.video_url);
      return '/images/default-thumbnail.png';
    } else if (post.acf_fields.image) {
      return post.acf_fields.image;
    } else {
      return '/images/default-thumbnail.png';
    }
  };

  const decodeTitle = (title) => (title ? decode(title) : '');

  const truncateTitle = (title, wordLimit) => {
    const decoded = decodeTitle(title);
    const words = decoded.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return decoded;
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-1.5 h-10 bg-[#AD88C6] rounded-full" />
        <h2 className="text-[#474F7A] text-2xl lg:text-3xl font-bold">მაუწყებელი გირჩევთ</h2>
      </div>

      {/* Mobile - Horizontal Scroll */}
      <div className="flex lg:hidden overflow-x-auto hide-scroll-bar -mx-4 px-4">
        <div className="flex gap-4">
          {posts.map((post, index) => (
            <Link href={constructUrl(post)} key={index} className="group block w-[280px] flex-shrink-0">
              <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl 
                                 transition-all duration-500 border border-[#E0DBE8]/30 h-full">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={getMediaThumbnail(post)}
                    alt={decodeTitle(post.title)}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="transition-transform duration-700 group-hover:scale-110"
                    priority={index === 0}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent 
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play icon - only for videos */}
                  {post.acf_fields.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#AD88C6] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2 
                                group-hover:text-[#AD88C6] transition-colors duration-300">
                    {decodeTitle(post.title)}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop - Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <Link href={constructUrl(post)} key={index} className="group block">
            <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl 
                               transition-all duration-500 transform hover:-translate-y-2
                               border border-[#E0DBE8]/30 h-full">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={getMediaThumbnail(post)}
                  alt={decodeTitle(post.title)}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="transition-transform duration-700 group-hover:scale-110"
                  priority={index === 0}
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Play icon for videos */}
                {post.acf_fields.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 
                                 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center
                                   transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-5 h-5 text-[#AD88C6] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2 
                              group-hover:text-[#AD88C6] transition-colors duration-300">
                  {decodeTitle(post.title)}
                </h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
};

export default HomePageRcheuli;
