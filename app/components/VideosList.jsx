"use client";

import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import Image from "next/image";
import CustomYoutubePlayer from "./CustomYoutube";
import Link from "next/link";
import moment from 'moment';

const PlayButton = ({ onClick }) => (
  <img
    src="/images/card-play-button.png"
    alt="play button"
    width={42}
    height={42}
    onClick={onClick}
    className="cursor-pointer transform hover:scale-110"
  />
);

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const fetchYoutubeVideoDetails = async (videoId, apiKey) => {
  const cachedDate = localStorage.getItem(videoId);
  if (cachedDate) {
    return cachedDate;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const publishedAt = data.items[0].snippet.publishedAt;
      localStorage.setItem(videoId, publishedAt);
      return publishedAt;
    }
  } catch (error) {
    console.error(`Failed to fetch YouTube video details for ${videoId}:`, error);
  }
  return null;
};

// Mapping of post types to URL-friendly versions
const postTypeUrlMap = {
  'kalaki': 'qalaqi',
  'main': 'main',
  'mecniereba': 'mecniereba',
  'medicina': 'medicina',
  'msoflio': 'msoflio',
  'saxli': 'saxli-yvelas',
  'shroma': 'shroma',
  'xelovneba': 'xelovneba'
};

const VideoCard = ({ videoId, caption, onSelect, postType }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);
  const postTypeUrl = postTypeUrlMap[postType] || postType; // Map the post type to URL-friendly version

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent the card click from propagating
    onSelect(videoId);
  };

  const videoPageUrl = `/${postTypeUrl}?videoId=${videoId}`;

  return (
    <div className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56">
      <div
        className="relative w-full bg-cover bg-center rounded-lg"
        style={{ height: "70%" }}
        onClick={handlePlayClick}
      >
        <div
          style={{ backgroundImage: `url(${thumbnailUrl})`, height: "100%" }}
          className="w-full bg-cover bg-center rounded-lg"
        ></div>
        <div className="absolute inset-0 flex justify-center items-center">
          <PlayButton onClick={handlePlayClick} />
        </div>
      </div>
      <Link href={videoPageUrl} className="text-white text-sm font-semibold cursor-pointer">
        {caption}
      </Link>
    </div>
  );
};

function VideosList({ endpoint, title }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    try {
      const response = await fetch('https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/all_videos');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const apiKey = "AIzaSyDd4yHryI5WLPLNjpKsiuU1bYHnBgcK_u8"; // Your YouTube API key here

      const videos = await Promise.all(data.map(async video => {
        const videoId = extractVideoId(video.video_url);
        let uploadDate = localStorage.getItem(videoId);
        if (!uploadDate) {
          uploadDate = await fetchYoutubeVideoDetails(videoId, apiKey);
          localStorage.setItem(videoId, uploadDate);
        }
        return {
          post_id: video.post_id,
          title: video.title,
          videoId,
          post_type: video.post_type,
          uploadDate
        };
      }));

      // Sort videos by upload date in descending order (newest first)
      videos.sort((a, b) => moment(b.uploadDate) - moment(a.uploadDate));

      setVideos(videos);
      setError(null);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [endpoint]);

  const handleVideoSelect = useCallback((videoId) => {
    setSelectedVideoId(videoId);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setSelectedVideoId(null);
  }, []);

  const handleVideoContainerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      <div className="w-full sm:w-10/12 flex items-center justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="text-[#474F7A] text-[24px] font-bold">{title}</p>
      </div>
      {loading ? (
        <img className="text-center mt-10" src="/images/loader.svg" alt="loading" />
      ) : error ? (
        <p className="text-center mt-10 text-red-500">{error}</p>
      ) : (
        <>
          <section className="lg:grid lg:grid-cols-4 hidden w-10/12 mt-5 gap-[20px] mx-auto">
            {videos.map((video) => (
              <div key={video.post_id} className="px-2 w-full">
                <VideoCard
                  videoId={video.videoId}
                  caption={video.title}
                  onSelect={handleVideoSelect}
                  postType={video.post_type} // Ensure post_type is passed correctly
                />
              </div>
            ))}
          </section>
          <div className="flex sm:hidden overflow-x-auto hide-scroll-bar pl-2 mt-5">
            <div className="flex">
              {videos.map((video) => (
                <div key={video.post_id} className="inline-block px-2 w-[248px]">
                  <VideoCard
                    videoId={video.videoId}
                    caption={video.title}
                    onSelect={handleVideoSelect}
                    postType={video.post_type} // Ensure post_type is passed correctly
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {selectedVideoId && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Video Modal"
          className="modalContent z-40"
          ariaHideApp={false}
          style={{
            overlay: {
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
          }}
        >
          <div className="modalContentArea" onClick={closeModal}>
            <div className="max-w-[900px] mx-auto" onClick={handleVideoContainerClick}>
              <CustomYoutubePlayer videoId={selectedVideoId} numVideos={2}/>
            </div>
          </div>
          <button onClick={closeModal} className="absolute top-0 left-10 z-50">
            <Image src="/images/cross.svg" alt="close" width={70} height={70} />
          </button>
        </Modal>
      )}
    </>
  );
}

export default VideosList;
