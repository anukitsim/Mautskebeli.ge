'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title;
  };

  return (
    <>
      <div className="w-10/12 mx-auto mt-5 lg:mt-14">
      <p className="text-[#474F7A] text-[24px] font-bold ml-[-20px] lg:ml-0 mt-20">მაუწყებელი გირჩევთ</p>
      </div>
      <div className="flex lg:hidden overflow-x-auto hide-scroll-bar pl-2 mt-6 ml-4">
        <div className="flex">
          {posts.map((post, index) => (
            <div key={index} className="inline-block px-2 w-[248px]">
              <Link href={constructUrl(post)}>
                <div className="w-full aspect-w-16 aspect-h-9 rounded-t-lg lg:rounded-t-lg lg:rounded-b-none overflow-hidden relative bg-transparent">
                  <Image
                    src={getMediaThumbnail(post)}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw)"
                    priority={index === 0}
                  />
                </div>
              </Link>
              <div className="w-full bg-[#AD88C6] h-10 lg:rounded-b-lg p-2">
                <Link href={constructUrl(post)}>
                  <p className="text-white text-sm">{truncateTitle(post.title, 3)}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="lg:flex hidden w-10/12 mt-5 gap-[20px] mx-auto">
        {posts.map((post, index) => (
          <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col">
            <Link href={constructUrl(post)}>
              <div className="w-full aspect-w-16 aspect-h-9 rounded-t-lg lg:rounded-t-lg lg:rounded-b-none overflow-hidden relative bg-transparent">
                <Image
                  src={getMediaThumbnail(post)}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  priority={index === 0}
                />
              </div>
            </Link>
            <div className="w-full bg-[#AD88C6] h-[64px] lg:rounded-b-lg p-2">
              <Link href={constructUrl(post)}>
                <p className="text-white text-sm">{truncateTitle(post.title, 6)}</p>
              </Link>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default HomePageRcheuli;
