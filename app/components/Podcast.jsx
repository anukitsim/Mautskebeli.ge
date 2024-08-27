"use client";

import React, { useEffect, useState, useRef } from "react";
import CustomYoutubePlayer from "./CustomYoutube";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// Utility functions to detect iOS and Safari
const isIOS = () => {
  return (
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.platform) &&
    navigator.userAgent.includes("Safari") &&
    !navigator.userAgent.includes("Chrome")
  );
};

const isSafari = () => {
  return (
    typeof window !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  );
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
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

const VideoCard = ({ videoId, caption, onSelect }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);

  return (
    <div
      className="relative flex flex-col items-center w-full max-w-[248px] p-2.5 gap-2 mx-auto my-2 bg-[#AD88C6] rounded-lg cursor-pointer"
      style={{ height: '206px' }}
      onClick={() => onSelect(videoId)}
    >
      <div
        className="w-full h-40 bg-cover bg-center rounded-lg"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton onClick={() => onSelect(videoId)} />
        </div>
      </div>
      <p className="text-sm font-semibold text-center text-white truncate w-full px-2" style={{ height: '50px' }}>
        {caption}
      </p>
    </div>
  );
};

const Podcast = () => {
  const searchParams = useSearchParams();
  const idInQueryParams = searchParams.get("chId");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 4;
  const channelId = idInQueryParams
    ? idInQueryParams
    : "UC6TjRdvXOknZBbtXiePp1HA";
  const apiKey = "AIzaSyDd4yHryI5WLPLNjpKsiuU1bYHnBgcK_u8";
  const playlistId = "PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy";
  const [liveStream, setLiveStream] = useState({});
  const [lastSelectedVideoId, setLastSelectedVideoId] = useState("");
  const [customPlayerKey, setCustomPlayerKey] = useState(0);

  const mainVideoRef = useRef(null);
  const router = useRouter();
  const isSafariIOS = isIOS() && isSafari();

  const handleVideoCardClick = (videoId) => {
    setSelectedVideoId(videoId);
    setCustomPlayerKey((prevKey) => prevKey + 1);
    mainVideoRef.current?.scrollIntoView({ behavior: "smooth" });
    router.push(`?chId=${channelId}&videoId=${videoId}`, undefined, { shallow: true });
  };

  useEffect(() => {
    const checkLiveStatus = async () => {
      if (!isLive) {
        try {
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

          const raw = JSON.stringify({
            channelId,
          });

          const response = await fetch(`/api/get-youtube-live-feed-id`, {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          });

          const {
            data: { stream, isStreaming },
          } = await response.json();

          setIsLive(isStreaming);
          setLiveStream(stream);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setIsLive(false);
          setLoading(false);
        }
      }
    };

    const intervalId = setInterval(checkLiveStatus, 60000);

    checkLiveStatus();

    return () => clearInterval(intervalId);
  }, [channelId]);

  useEffect(() => {
    if (selectedVideoId !== lastSelectedVideoId) {
      const selectedVideo = videos.find(
        (video) => video.id === selectedVideoId
      );
      setLastSelectedVideoId(selectedVideoId);
    }
  }, [selectedVideoId, lastSelectedVideoId, videos]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=45&playlistId=${playlistId}&key=${apiKey}`
        );

        if (!playlistResponse.ok) {
          throw new Error("Failed to fetch videos from the playlist");
        }

        const playlistData = await playlistResponse.json();
        const playlistVideos = playlistData.items.map((item) => ({
          id: item.snippet.resourceId.videoId,
          snippet: item.snippet,
        }));

        const sortedVideos = playlistVideos.sort((a, b) => {
          const dateA = new Date(a.snippet.publishedAt);
          const dateB = new Date(b.snippet.publishedAt);
          return dateB.getTime() - dateA.getTime();
        });

        setVideos(sortedVideos);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVideos();
  }, [apiKey, playlistId]);

  useEffect(() => {
    if (isLive) {
      setSelectedVideoId(liveStream?.id);
      setCustomPlayerKey((prevKey) => prevKey + 1);
    }
  }, [isLive]);

  useEffect(() => {
    const initialVideoId = searchParams.get("videoId") || (videos[0] && videos[0].id);
    if (initialVideoId) {
      handleVideoCardClick(initialVideoId);
    }
  }, [videos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src="/images/loader.svg" alt="loading" width={120} height={120} />
      </div>
    );
  }

  const handleNextPage = () => {
    if (currentPage * videosPerPage < videos.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const paginatedVideos = videos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );

  return (
    <>
      <div className="w-full px-4">
        {videos.length > 0 && (
          <>
            {isLive && selectedVideoId === liveStream?.id && (
              <h1 className="text-[#FECE27] text-[20px] font-extrabold mt-5 mb-4 animate-pulse">
                პირდაპირი ეთერი
              </h1>
            )}

            <div ref={mainVideoRef} className="ml-[-5%] pt-3">
              <CustomYoutubePlayer
                key={customPlayerKey}
                videoId={selectedVideoId ? selectedVideoId : videos[0].id}
                onClose={() => setSelectedVideoId("")}
                videoData={videos.find((video) => video.id === selectedVideoId)}
              />
            </div>
            <div className="mx-auto lg:mt-20 mt-[30px] lg:w-10/12 w-full flex flex-col gap-[23px] lg:px-2">
              <h2 className="text-[32px] text-[#474F7A] font-bold">
                {videos.find((video) => video.id === selectedVideoId)?.snippet
                  .title || ""}
              </h2>
              <p className="text-[16px] text-[#474F7A] font-light">
                {videos.find((video) => video.id === selectedVideoId)?.snippet
                  .description || ""}
              </p>
              <div className="flex lg:flex-row flex-col gap-2 mb-20 mt-2">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-[#FECE27] whitespace-nowrap text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center">
                    <Image
                      src="/images/youtube-share.png"
                      alt="youtube share"
                      width={24}
                      height={24}
                    />
                    YouTube - ზე გადასვლა
                  </button>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://www.youtube.com/watch?v=${selectedVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center">
                    <Image
                      src="/images/share.png"
                      alt="facebook share"
                      width={24}
                      height={24}
                    />
                    გაზიარება
                  </button>
                </a>
              </div>
            </div>
            <div className="flex justify-end mt-4 lg:pr-14">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="rounded-lg mx-2"
              >
                <img
                  src="/images/videos-left.svg"
                  alt="playbutton"
                  width={32}
                  height={32}
                />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage * videosPerPage >= videos.length}
                className="rounded-lg mx-2"
              >
                <img
                  src="/images/videos-right.svg"
                  alt="playbutton"
                  width={32}
                  height={32}
                />
              </button>
            </div>
            <div className="w-full mx-auto lg:grid hidden grid-cols-1  lg:grid-cols-4 gap-4 px-2 my-4">
              {paginatedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  videoId={video.id}
                  caption={video.snippet.title}
                  onSelect={handleVideoCardClick}
                />
              ))}
            </div>
            <div className="flex lg:hidden mt-10 overflow-x-auto hide-scroll-bar pl-2 pr-2">
              <div className="flex gap-4">
                {paginatedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    videoId={video.id}
                    caption={video.snippet.title}
                    onSelect={handleVideoCardClick}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Podcast;
