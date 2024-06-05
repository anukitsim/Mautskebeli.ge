// app/bolo-ambebi/page.jsx
import React from 'react';
import { fetchMultipleFacebookPosts } from '@/utils/fetchMultipleFacebookPosts';
import PostContent from '@/app/components/PostContent';

const BoloAmbebiPage = async () => {
  let posts, error;

  try {
    posts = await fetchMultipleFacebookPosts(10);  // Fetch first 4 posts
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-[#FECE27] flex flex-col gap-6 items-center mx-auto w-full">
      {posts.map((post, index) => (
        post ? <PostContent key={index} post={post} error={null} /> : <p key={index}>Error fetching post {index + 1}</p>
      ))}
    </div>
  );
};

export default BoloAmbebiPage;
  