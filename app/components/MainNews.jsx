// app/components/MainNews.jsx (Server Component)
import React from "react";
import MainNewsClient from "./MainNewsClient";

const videoPostTypes = [
  "kalaki",
  "mecniereba",
  "medicina",
  "msoflio",
  "saxli",
  "shroma",
  "xelovneba",
  "ekonomika",
  "resursebi",
  "sporti-videos",
];

// Extract the YouTube video ID (unchanged)
const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

// (1) Temporary: remove HEAD check, always return the original image.
const getImageUrl = (post) => {
  // For now, just return the original WP image URL
  return post.image; 
};

const MainNews = async () => {
  let slides = [];

  try {
    const response = await fetch(
      `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/main-posts`,
      {
        // Revalidate every 60s (ISR)
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    let data = await response.json();

    // Sort by date (descending)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // For video posts, fetch additional details
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
            console.error("Failed to fetch video details:", videoResponse.status);
            return post;
          }
        } catch (error) {
          console.error("Error fetching video details:", error);
          return post;
        }
      });

    const videoDetails = await Promise.all(videoDetailsPromises);

    // (2) Build final slides with a simpler getImageUrl (no HEAD check)
    const updatedSlidesPromises = data.map(async (post) => {
      const videoDetail = videoDetails.find((v) => v.id === post.id) || {};
      // Combine original post + video detail
      const enrichedPost = { ...post, ...videoDetail };

      // Just use post.image for now
      const finalImageUrl = getImageUrl(enrichedPost);

      return {
        ...enrichedPost,
        image: finalImageUrl,
      };
    });

    const updatedSlides = await Promise.all(updatedSlidesPromises);

    // Limit to the latest 5
    slides = updatedSlides.slice(0, 5);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return <MainNewsClient slides={slides} />;
};

export default MainNews;
