"use client";

import React, { useEffect, useState, useRef, Suspense, useCallback } from "react";
import CustomYoutubePlayer from "../components/CustomYoutube";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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

const VideoCard = ({ videoId, acf, onSelect }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className="relative flex flex-col items-center w-full max-w-[248px] p-2.5 gap-2 mx-auto my-2 bg-[#AD88C6] rounded-lg cursor-pointer"
      style={{ height: "206px" }}
      onClick={() => onSelect(videoId, acf)}
    >
      <div
        className="w-full h-40 bg-cover bg-center rounded-lg"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton onClick={() => onSelect(videoId, acf)} />
        </div>
      </div>
      <p
        className="text-sm font-semibold text-center text-white truncate w-full px-2"
        style={{ height: "50px" }}
      >
        {acf && acf.title ? acf.title : "No title available"}
      </p>
    </div>
  );
};

function ShromaVideos() {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [activeVideoAcf, setActiveVideoAcf] = useState({
    title: "",
    description: "",
  });
  const [lastSelectedVideoId, setLastSelectedVideoId] = useState(null);
  const [customPlayerKey, setCustomPlayerKey] = useState(0);
  const shareOptionsRef = useRef(null);

  const videoPlayerRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
    window.open(shareUrl, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      activeVideoAcf.title + " " + activeVideoAcf.description
    );
    const url = `${window.location.href}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      url
    )}`;
    window.open(shareUrl, "_blank");
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/shroma?per_page=100`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVideos(data);
        const initialVideoId = searchParams.get("videoId") || extractVideoId(data[0]?.acf.video_url);
        const initialVideo = data.find(video => extractVideoId(video.acf.video_url) === initialVideoId);
        if (initialVideo) {
          handleVideoSelect(initialVideoId, initialVideo.acf);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchParams]);  // Ensure updates if searchParams change

  useEffect(() => {
    if (activeVideoId !== lastSelectedVideoId) {
      setLastSelectedVideoId(activeVideoId);
      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeVideoId, lastSelectedVideoId]);

  const handleVideoSelect = (videoId, acf) => {
    setActiveVideoId(videoId);
    setActiveVideoAcf(acf);
    setCustomPlayerKey((prevKey) => prevKey + 1);
    router.push(`?videoId=${videoId}`, undefined, { shallow: true });
  };

  const handleClickOutside = useCallback((event) => {
    if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target)) {
      setShowShareOptions(false);
    }
  }, []);

  useEffect(() => {
    if (showShareOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareOptions, handleClickOutside]);

  const endIndex = currentPage * 16;
  const startIndex = endIndex - 16;
  const paginatedVideos = videos.slice(startIndex, endIndex);

  return (
    <>
      <MenuProvider>
        <Header />
        <Navigation onVideoSelect={handleVideoSelect} />
      </MenuProvider>
      <div>
        {loading ? (
          <img src="/images/loader.svg" />
        ) : (
          videos.length > 0 && (
            <>
              <div ref={videoPlayerRef} className="relative mt-[74px]" style={{ zIndex: 10 }}>
                <CustomYoutubePlayer key={customPlayerKey} videoId={activeVideoId} />
                <div className="mx-auto mt-[7%] lg:w-10/12 sm:w-full flex flex-col gap-[23px] pl-5 pr-5">
                  <h2 className="text-[32px] text-[#474F7A] font-bold">
                    {activeVideoAcf.title}
                  </h2>
                  <div className="flex lg:flex-row flex-col gap-2 mt-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="bg-[#FECE27] whitespace-nowrap text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-seibold rounded flex gap-[12px] items-center justify-center">
                        <Image
                          src="/images/youtube-share.png"
                          alt="facebook share"
                          width={24}
                          height={24}
                        />
                        YouTube - ზე გადასვლა
                      </button>
                    </a>
                    <button
                      onClick={() => setShowShareOptions(true)}
                      className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-seibold rounded flex gap-[12px] items-center justify-center"
                    >
                      <Image
                        src="/images/share.png"
                        alt="share"
                        width={24}
                        height={24}
                      />
                      გაზიარება
                    </button>
                    {showShareOptions && (
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} className="bg-gray-800 bg-opacity-50 flex items-center justify-center">
                        <div ref={shareOptionsRef} className="rounded-lg p-6 w-80 flex flex-col items-center">
                          <h2 className="text-xl text-white font-bold mb-4">
                            გააზიარე
                          </h2>
                          <div className="flex items-center gap-5 ">
                            <button
                              onClick={shareOnFacebook}
                              className=" text-left  text-white"
                            >
                              <Image
                                src="/images/facebook.svg"
                                alt="facebook share"
                                width={44}
                                height={44}
                              />
                             
                            </button>
                            <button
                              onClick={shareOnTwitter}
                              className=" text-left  text-white"
                            >
                              <Image
                                src="/images/twitter.svg"
                                alt="twitter share"
                                width={44}
                                height={44}
                              />
                             
                            </button>
                          </div>
                         
                         
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[16px] text-[#474F7A] font-llight">
                    {activeVideoAcf.description}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-[16px] lg:w-10/12 sm:w-full mx-auto mt-[100px] pr-5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <img
                    src="/images/videos-left.png"
                    alt="playbutton"
                    width={32}
                    height={32}
                  />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={endIndex >= videos.length}
                >
                  <img
                    src="/images/videos-right.png"
                    alt="playbutton"
                    width={32}
                    height={32}
                  />
                </button>
              </div>
              <div className="w-10/12 mx-auto lg:grid hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 my-4">
                {paginatedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    videoId={extractVideoId(video.acf.video_url)}
                    acf={video.acf}
                    onSelect={handleVideoSelect}
                  />
                ))}
              </div>
              <div className="flex sm:hidden mt-10 overflow-x-auto hide-scroll-bar pl-2 pr-2">
                <div className="flex gap-4">
                  {paginatedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      videoId={extractVideoId(video.acf.video_url)}
                      acf={video.acf}
                      onSelect={handleVideoSelect}
                    />
                  ))}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

function WrappedShromaVideos() {
  return (
    <Suspense fallback={<div> <img src="/images/loader.svg" /></div>}>
      <ShromaVideos />
    </Suspense>
  );
}

export default function Page() {
  return <WrappedShromaVideos />;
}
