'use client';

import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import Image from "next/image";
import CustomYoutubePlayer from "./CustomYoutube";
import Link from "next/link";

// Utility function to decode HTML entities
const decodeHtmlEntities = (text) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const PlayButton = ({ onClick }) => (
  <img
    src="/images/card-play-button.svg"
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

const VideoCard = ({ videoId, caption, onSelect, postType, isMobile }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (!isMobile) {
      onSelect(videoId);  // Show popup on desktop
    }
  };

  const videoPageUrl = `/${postType}?videoId=${videoId}`;

  return (
    <div
      className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56"
    >
      <div
        className="relative w-full bg-cover bg-center rounded-lg"
        style={{ height: "70%" }}
        onClick={isMobile ? () => window.location.href = videoPageUrl : handlePlayClick}  // Open link directly on mobile
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
        {decodeHtmlEntities(caption)}
      </Link>
    </div>
  );
};

function HomePageVideos() {
  const [latestVideos, setLatestVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (document.getElementById('__next')) {
      Modal.setAppElement('#__next');
    }

    // Detect if it's mobile (you can adjust the width condition as necessary)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);  // Treat as mobile if screen width <= 768px
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchLatestVideos = async () => {
    const endpoint = "https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/";
    const postTypes = [
      "mecniereba",
      "medicina",
      "msoflio",
      "saxli",
      "kalaki",
      "shroma",
      "xelovneba",
      "resursebi",
      "ekonomika"
    ];

    try {
      const requests = postTypes.map((postType) =>
        fetch(`${endpoint}${postType}?per_page=4&orderby=date&order=desc&_=${new Date().getTime()}`)
      );
      const responses = await Promise.all(requests);
      const videos = await Promise.all(
        responses.map((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          } else {
            return response.json();
          }
        })
      );

      const allVideos = videos.flat().map(video => ({
        ...video,
        post_type: video.type
      }));

      const sortedVideos = allVideos.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
      
      localStorage.setItem('cachedVideos', JSON.stringify(sortedVideos));
      setLatestVideos(sortedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    const cachedVideos = JSON.parse(localStorage.getItem('cachedVideos'));

    if (cachedVideos) {
      setLatestVideos(cachedVideos);
    }

    fetchLatestVideos();
  }, []);

  const handleVideoSelect = useCallback((videoId) => {
    if (!isMobile) {
      setSelectedVideoId(videoId);
      setModalIsOpen(true);
    }
  }, [isMobile]);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setSelectedVideoId(null);
  }, []);

  const handleVideoContainerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleModalClick = useCallback((e) => {
    closeModal();
  }, [closeModal]);

  return (
    <>
      <div className="w-full sm:w-10/12 flex items-center justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="text-[#474F7A] text-[24px] font-bold">ვიდეო</p>
        <Link href='/all-videos' className="text-[#474F7A] text-[14px] font-semibold">ნახე ყველა</Link>
      </div>
      <div className="flex sm:hidden overflow-x-auto hide-scroll-bar pl-2 mt-5">
        <div className="flex">
          {latestVideos.map((video) => (
            <div key={video.id} className="inline-block px-2 w-[248px]">
              <VideoCard
                videoId={extractVideoId(video.acf.video_url)}
                caption={video.title.rendered}
                onSelect={handleVideoSelect}
                postType={video.post_type}
                isMobile={isMobile}  // Pass isMobile flag
              />
            </div>
          ))}
        </div>
      </div>
      <section className="lg:flex hidden w-10/12 mt-5 gap-[20px] mx-auto">
        {latestVideos.map((video) => (
          <div
            key={video.id}
            className="px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
          >
            <VideoCard
              videoId={extractVideoId(video.acf.video_url)}
              caption={video.title.rendered}
              onSelect={handleVideoSelect}
              postType={video.post_type}
              isMobile={isMobile}  // Pass isMobile flag
            />
          </div>
        ))}
      </section>
      {selectedVideoId && !isMobile && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Video Modal"
          ariaHideApp={false}
          className="modalContent z-40"
          style={{
            overlay: {
              zIndex: 1000,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
            },
            content: {
              outline: 'none'
            }
          }}
        >
          <div className="modalContentArea" onClick={handleModalClick}>
            <div className="max-w-[900px] mx-auto pt-20" onClick={handleVideoContainerClick}>
              <CustomYoutubePlayer videoId={selectedVideoId} numVideos={2} />
            </div>
          </div>
          <button
            onClick={closeModal}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-10 lg:left-10 z-50"
          >
            <Image src="/images/cross.svg" alt="close" width={70} height={70} priority />
          </button>
        </Modal>
      )}
    </>
  );
}

export default HomePageVideos;
