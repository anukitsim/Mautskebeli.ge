'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import CustomYoutubePlayer from '../components/CustomYoutube';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/main/${id}?acf_format=standard&_fields=id,title,acf,date`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setPost(data);
        } catch (error) {
          console.error('Error fetching post data:', error);
        }
      };

      fetchPost();
    }
  }, [id]);

  if (!post) {
    return   <img src="/images/loader.svg" />;
  }

  const getYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^\n\s&]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="post-container mx-auto mt-10 w-10/12 p-5">
      <h1 className="text-3xl font-bold mb-5 text-start ml-24">{post.title.rendered}</h1>
      {post.acf.video ? (
        <div className="relative w-full mb-5 aspect-w-16 aspect-h-9">
          <CustomYoutubePlayer videoUrl={post.acf.video} videoId={getYoutubeId(post.acf.video)} />
        </div>
      ) : (
        post.acf.image && (
            <div className="relative w-full h-96 mb-5">
              <Image
                src={post.acf.image}
                alt={post.acf.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          )
        )}
        <p className="text-lg leading-7 mb-5 ml-24">{post.acf['main-text']}</p>
    </div>
  );
};

export default PostPage;
