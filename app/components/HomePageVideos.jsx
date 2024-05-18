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
      className="relative flex flex-col items-start gap-2 p-2.5 rounded-lg bg-[#AD88C6] h-56" // Added 'relative' for positioning context
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
        {/* Position PlayButton in the center */}
        <div className="absolute inset-0 flex justify-center items-center">
          <PlayButton onClick={() => onSelect(videoId)} />
        </div>
      </div>
      <p className="text-white text-sm font-semibold">{caption}</p>
    </div>
  );
};

function HomePageVideos() {
  const [randomVideos, setRandomVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);



  const fetchRandomVideos = async () => {
    const endpoint = "https://mautskebeli.local/wp-json/wp/v2/";
    try {
      const postTypes = [
        "mecniereba",
        "medicina",
        "msoflio",
        "saxli",
        "kalaki",
        "shroma",
        "xelovneba",
      ];
      const requests = postTypes.map((postType) =>
        fetch(`${endpoint}${postType}?per_page=4&orderby=date&order=desc`)
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
      const allVideos = videos.flat().slice(0, 4); // Taking only the first four videos
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

  const handleVideoContainerClick = useCallback((e) => {
    e.stopPropagation(); // Stop the click from propagating to the modal overlay
  }, []);


  return (
    <>
      <div className="w-full sm:w-10/12 flex justify-between lg:mt-20 mt-[42px] mx-auto pl-4 pr-4 lg:pl-2 lg:pr-2">
        <p className="section-title">ვიდეო</p>
        <p className="see-all">ნახე ყველა</p>
      </div>
      {/* Mobile View: Horizontal scroll container */}
      <div className="flex sm:hidden overflow-x-auto hide-scroll-bar pl-2 mt-5">
        <div className="flex ">
          {randomVideos.map((video) => (
            <div key={video.id} className="inline-block px-2 w-[248px]">
              <VideoCard
                videoId={extractVideoId(video.acf.video_url)}
                caption={video.title.rendered}
                onSelect={handleVideoSelect}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop and Tablet View: Grid layout */}
      <section className="lg:flex hidden w-10/12 mt-5  gap-[20px] mx-auto">
        {randomVideos.map((video) => (
          <div
            key={video.id}
            className="px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
          >
            {" "}
            {/* Add padding back on individual cards */}
            <VideoCard
              videoId={extractVideoId(video.acf.video_url)}
              caption={video.title.rendered}
              onSelect={handleVideoSelect}
            />
          </div>
        ))}
      </section>
      {selectedVideoId && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal} // Closes the modal when the overlay is clicked
          contentLabel="Video Modal"
          className="modalContent z-40"
          style={{
            overlay: {
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.75)', // Ensuring modal background is semi-transparent
            },
          }}
        >
          {/* This should correctly close the modal when clicked */}
          <div className="modalContentArea" onClick={closeModal}>
            {/* This div prevents modal close when clicking on the video */}
            <div className="max-w-[900px] mx-auto " onClick={handleVideoContainerClick}>
              <CustomYoutubePlayer videoId={selectedVideoId} />
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

export default HomePageVideos;
