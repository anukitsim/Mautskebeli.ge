"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import CustomYoutubePlayer from '@/app/components/CustomYoutube';

const fetchVideoPost = async (id) => {
  try {
    console.log(`Fetching post with ID: ${id}`);
    const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/acf-fields`);
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      throw new Error('Failed to fetch video post');
    }
    const data = await res.json();
    console.log('Fetched data:', data);

    const post = data.find(post => post.post_id === parseInt(id));
    if (!post) {
      console.error('Post not found with ID:', id);
      throw new Error('Post not found');
    }
    console.log('Found post:', post);
    return post;
  } catch (error) {
    console.error('Error fetching video post:', error);
    return null;
  }
};

const VideoPage = () => {
  const params = useParams();
  const id = params.id;
  const [videoPost, setVideoPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error('No ID provided');
      setLoading(false);
      return;
    }

    const getVideoPost = async () => {
      const fetchedVideoPost = await fetchVideoPost(id);
      if (fetchedVideoPost) {
        setVideoPost(fetchedVideoPost);
      } else {
        console.error('Video post not found or failed to fetch');
      }
      setLoading(false);
    };

    getVideoPost();
  }, [id]);

  if (loading) {
    return <div> <img src="/images/loader.svg" /></div>;
  }

  if (!videoPost) {
    return <div>Video post not found</div>;
  }

  const videoUrl = videoPost.acf_fields.video_url;
  const videoId = extractVideoId(videoUrl);

  return (
    <section className="w-full mx-auto px-4 lg:px-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold mb-5 mt-10 text-left">{videoPost.title.rendered}</h1>
        <div className="relative w-full mb-5" style={{ paddingBottom: '56.25%', height: 0 }}>
          <div className="absolute top-0 left-0 w-full h-full">
            <CustomYoutubePlayer videoUrl={videoUrl} videoId={videoId} numVideos={2}/>
          </div>
        </div>
        <p className="text-[16px] text-[#474F7A] font-light lg:ml-20 p-5 mb-5 mt-[270px] text-balance lg:mt-10 w-full  px-4 lg:px-0">{videoPost.acf_fields.description}</p>
        <div className="flex flex-col  lg:ml-20 lg:flex-row gap-4 items-start lg:items-start px-4 lg:px-0">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-[#FECE27] whitespace-nowrap text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center">
              <Image
                src="/images/youtube-share.png"
                alt="YouTube"
                width={24}
                height={24}
              />
              YouTube - ზე გადასვლა
            </button>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${videoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center">
              <Image
                src="/images/share.png"
                alt="Facebook Share"
                width={24}
                height={24}
              />
              გაზიარება
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoPage;

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};
