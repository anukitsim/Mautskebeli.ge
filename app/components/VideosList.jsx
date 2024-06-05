"use client";

import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import Image from "next/image";
import CustomYoutubePlayer from "./CustomYoutube";

const PlayButton = ({ onClick }) => (
  <img
    src="/images/card-play-button.png"
    alt="playbutton"
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

const VideoCard = ({ videoId, caption, onSelect }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);

  return (
    <div
      className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56"
      onClick={() => onSelect(videoId)}
    >
      <div
        className="relative w-full bg-cover bg-center rounded-lg"
        style={{ height: "70%" }}
      >
        <div
          style={{ backgroundImage: `url(${thumbnailUrl})`, height: "100%" }}
          className="w-full bg-cover bg-center rounded-lg"
        ></div>
        <div className="absolute inset-0 flex justify-center items-center">
          <PlayButton onClick={() => onSelect(videoId)} />
        </div>
      </div>
      <p className="text-white text-sm font-semibold">{caption}</p>
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
      const response = await fetch('https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/videos/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const videos = data.map(video => ({
        post_id: video.post_id,
        title: video.title,
        videoId: extractVideoId(video.video_url)
      }));
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
