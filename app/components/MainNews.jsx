// app/components/MainNews.js (Server Component)

import React from 'react';
import MainNewsClient from './MainNewsClient';

const videoPostTypes = [
  'kalaki',
  'mecniereba',
  'medicina',
  'msoflio',
  'saxli',
  'shroma',
  'xelovneba',
  'ekonomika',
  'resursebi',
  'sporti-videos',
];

const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

// Utility to check if a URL is valid
const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' }); // Use HEAD for lightweight checks
    return response.ok;
  } catch (error) {
    console.error(`Error validating URL: ${url}`, error);
    return false;
  }
};

// Utility to determine the correct URL
const getImageUrl = async (post) => {
  const baseR2Url = 'https://media.mautskebeli.ge/';
  const newUrl = `${baseR2Url}${post.image}`;
  const originalUrl = post.image;

  if (await isValidImageUrl(newUrl)) {
    return newUrl;
  }
  return originalUrl; // Fallback to the original URL if new one fails
};

const MainNews = async () => {
  let slides = [];

  try {
    const response = await fetch(
      `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/main-posts`,
      {
        // Enable ISR with revalidation every 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    let data = await response.json();

    // Sort posts by date to ensure we get the latest uploaded
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Fetch additional details for video posts
    const videoDetailsPromises = data
      .filter((post) => videoPostTypes.includes(post.post_type))
      .map(async (post) => {
        try {
          const videoResponse = await fetch(
            `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/${post.post_type}/${post.id}`
          );
          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            const videoId = extractVideoId(videoData.acf.video_url);
            return { ...post, videoId };
          } else {
            console.error(
              'Failed to fetch video details:',
              videoResponse.status
            );
            return post;
          }
        } catch (error) {
          console.error('Error fetching video details:', error);
          return post;
        }
      });

    const videoDetails = await Promise.all(videoDetailsPromises);

    const updatedSlidesPromises = data.map(async (post) => {
      const videoDetail = videoDetails.find(
        (videoPost) => videoPost.id === post.id
      );
      const enrichedPost = videoDetail || post;

      // Dynamically validate and update the image URL
      const validatedImageUrl = await getImageUrl(enrichedPost);

      return {
        ...enrichedPost,
        image: validatedImageUrl,
      };
    });

    const updatedSlides = await Promise.all(updatedSlidesPromises);

    // Limit to the latest 5 uploaded slides
    slides = updatedSlides.slice(0, 5);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  // Pass only the slides data to the client component
  return <MainNewsClient slides={slides} />;
};

export default MainNews;

