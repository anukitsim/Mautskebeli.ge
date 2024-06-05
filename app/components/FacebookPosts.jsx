"use client"

// app/components/FacebookPosts.jsx
import React, { useState, useEffect } from 'react';
import { fetchFacebookData } from '../../utils/fetchFacebookData';
import PostContent from './PostContent';

const FacebookPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedPosts = await fetchFacebookData();
        setPosts(fetchedPosts.slice(0, 4)); // Get the first 4 posts
      } catch (err) {
        console.error('Error fetching or processing data:', err.message);
        setError('Error fetching or processing data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="w-full flex flex-col gap-6 items-center mx-auto mt-10">
      {posts.map((post, index) => (
        <PostContent key={index} post={post} error={null} />
      ))}
    </div>
  );
};

export default FacebookPosts;
