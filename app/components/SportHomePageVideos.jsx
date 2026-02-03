"use client";

import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import Image from "next/image";
import CustomYoutubePlayer from "./CustomYoutube";
import Link from "next/link";

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
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const VideoCard = ({ videoId, caption, onSelect, postType }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent the card click from propagating
    onSelect(videoId);
  };

  const videoPageUrl = `/${postType}?videoId=${videoId}`;

  return (
    <div
      className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56"
    >
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

function SportHomePageVideos() {
  const [randomVideos, setRandomVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (document.getElementById('__next')) {
      Modal.setAppElement('#__next'); // Setting the app element
    }
  }, []);

  const fetchRandomVideos = async () => {
    const endpoint = "https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/";
    try {
      const postTypes = ["sporti-videos"];
      const requests = postTypes.map((postType) =>
        fetch(`${endpoint}${postType}?acf_format=standard&_fields=id,title,acf,date`)
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
        post_type: "all-sport-videos" // Ensure that post_type is correctly passed
      })).slice(0, 4);
      setRandomVideos(allVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchRandomVideos();
  }, []);

  const handleVideoSelect = useCallback((videoId) => {
    setSelectedVideoId(videoId);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setSelectedVideoId(null);
  }, []);

  const handleModalClick = useCallback((e) => {
    closeModal();
  }, [closeModal]);

  const handleVideoContainerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      <div className="w-full sm:w-10/12 flex items-center justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2 mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-[#AD88C6] rounded-full" />
          <h2 className="text-[#474F7A] text-2xl lg:text-3xl font-bold">ვიდეო</h2>
        </div>
        <Link 
          href="/all-sport-videos" 
          className="text-[#474F7A] text-sm font-semibold hover:text-[#AD88C6] 
                     transition-colors duration-300 flex items-center gap-2 group"
        >
          <span>ნახე ყველა</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="flex sm:hidden overflow-x-auto hide-scroll-bar pl-2">
        <div className="flex">
          {randomVideos.map((video) => (
            <div key={video.id} className="inline-block px-2 w-[248px]">
              <VideoCard
                videoId={extractVideoId(video.acf?.video)}
                caption={video.title.rendered}
                onSelect={handleVideoSelect}
                postType={video.post_type} // Passing post_type correctly
              />
            </div>
          ))}
        </div>
      </div>
      <section className="lg:flex hidden w-10/12 mt-5 gap-[20px] mx-auto">
        {randomVideos.map((video) => (
          <div
            key={video.id}
            className="px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
          >
            <VideoCard
              videoId={extractVideoId(video.acf?.video)}
              caption={video.title.rendered}
              onSelect={handleVideoSelect}
              postType={video.post_type} // Ensuring post_type is passed correctly
            />
          </div>
        ))}
      </section>
      {selectedVideoId && (
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
              outline: 'none' // Remove outline from modal content
            }
          }}
        >
          <div className="modalContentArea" onClick={handleModalClick}>
            <div className="max-w-[900px] mx-auto pt-20 px-4" onClick={handleVideoContainerClick}>
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

export default SportHomePageVideos;
