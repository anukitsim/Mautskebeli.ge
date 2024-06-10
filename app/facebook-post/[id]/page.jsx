"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import PostContent from '@/app/components/PostContent';

export default function Page() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get the dynamic ID from the URL

  useEffect(() => {
    if (!id) return; // Ensure ID is present
    console.log('ID from params:', id);

    async function fetchData() {
      try {
        const res = await fetch(`/api/facebook-post/data?id=${id}`);
        if (!res.ok) throw new Error('Failed to load the post');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error('Error fetching or processing data:', err);
        setError('Error fetching or processing data. Please try again later.');
      }
    }

    fetchData();
  }, [id]);

  return <PostContent post={post} error={error} />;
}
