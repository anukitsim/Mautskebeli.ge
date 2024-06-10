"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CustomYoutubePlayer from "@/app/components/CustomYoutube";

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

export default function VideoPage() {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/sporti-videos/videos/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVideoData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [id]);

  if (loading) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  if (error) {
    return <div>Error loading video data: {error}</div>;
  }

  if (!videoData) {
    return <div>No video data found</div>;
  }

  const videoId = extractVideoId(videoData.acf.video_url);

  return (
    <div>
      <div className="max-w-[900px] mx-auto mt-10">
        <CustomYoutubePlayer videoId={videoId} />
        <h2 className="text-2xl font-bold mt-4">{videoData.title.rendered}</h2>
        <p className="mt-2">{videoData.acf.description}</p>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")}
          >
            Watch on YouTube
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://www.youtube.com/watch?v=${videoId}`, "_blank")}
          >
            Share on Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
