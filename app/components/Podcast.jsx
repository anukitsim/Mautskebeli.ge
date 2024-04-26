"use client";

import React, { useEffect, useState, useRef } from "react";
import CustomYoutubePlayer from "./CustomYoutube";
import { useSearchParams } from "next/navigation";
import Image from "next/image";


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

// Ensures the video ID is correctly extracted from the URL
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
    <div className="relative flex flex-col items-center w-full max-w-sm p-2.5 gap-2 mx-auto my-2 bg-[#AD88C6] rounded-lg">
      <div className="w-full h-40 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${thumbnailUrl})` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton onClick={() => onSelect(videoId)} />
        </div>
      </div>
      <p className="text-sm font-semibold text-center text-white truncate w-full px-2">{caption}</p>
    </div>
  );
};

const Podcast = () => {
  const searchParams = useSearchParams();
  const idInQueryParams = searchParams.get("chId");
  const [videos, setVideos] = useState([]);
  const [loading,setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const channelId = idInQueryParams
    ? idInQueryParams
    : "UC6TjRdvXOknZBbtXiePp1HA";

  // const channelId = "UCMmpLL2ucRHAXbNHiCPyIyg";
  const apiKey = "AIzaSyDd4yHryI5WLPLNjpKsiuU1bYHnBgcK_u8";
  const playlistId = "PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy";
  const [liveStream, setLiveStream] = useState({});
  const [lastSelectedVideoId, setLastSelectedVideoId] = useState("");
  const [customPlayerKey, setCustomPlayerKey] = useState(0);

  const mainVideoRef = useRef(null);

  const handleVideoCardClick = (videoId) => {
    setSelectedVideoId(videoId);
    setCustomPlayerKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const checkLiveStatus = async () => {
      if(!isLive){
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

    // Check live status every 60 seconds (adjust as needed).
    const intervalId = setInterval(checkLiveStatus, 60000);

    // Perform initial check.
    checkLiveStatus();

    return () => clearInterval(intervalId); // Clear interval on component unmount.
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

        setVideos(sortedVideos.reverse());        
      } catch (error) {
        console.error(error);
      }
    };

    fetchVideos();
  }, [apiKey, playlistId]);

  useEffect(()=>{
    if(isLive){
        setSelectedVideoId(liveStream?.id);
        setCustomPlayerKey((prevKey) => prevKey + 1);
    }
  },[isLive])

   if (loading) {
      return (
        <div>
          <Image src="/images/loading.svg" alt="loading" width={120} height={120} />
        </div>
      );
    }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: "3", paddingLeft: "20px" }}>
        {videos.length > 0 && (
          <>
           {isLive && selectedVideoId === liveStream?.id && (
  <h1 className="text-3xl text-[#FECE27] font-bold mt-5 mb-4 animate-bounce">
    პირდაპირი ეთერი
  </h1>
)}

            <CustomYoutubePlayer
              ref={mainVideoRef}
              key={customPlayerKey}
              videoId={
            selectedVideoId ? selectedVideoId : videos.slice(-1)[0].id
              }
              onClose={() => setSelectedVideoId("")}
              videoData={videos.find((video) => video.id === selectedVideoId)}
              style={{ width: "100%", height: "500px" }}
              customOverlayStyle={{ height: "35%", top: "65%" }}
            />
          </>
        )}
      </div>
      <h1 className="pt-20 pr-5">არქივი</h1>
      <div
        style={{
          flex: "1",
          maxHeight: "640px",
          overflowY: "auto",
          position: "sticky",
          top: "0",
        }}
        className="mt-20 rounded-lg flex flex-col items-center mr-5 p-5  "
      >
        <div className="flex flex-col gap-5">
          {Object.values(liveStream || {})?.length > 0 && isLive&&  (
            <VideoCard
              isLive={isLive}
              videoId={liveStream?.id}
              caption={liveStream?.caption}
              onSelect={handleVideoCardClick}
              isSelected={liveStream.id === selectedVideoId}
            />
          )}

          {videos.map((video, index) => (
            <VideoCard
              key={video.id || index}
              videoId={video.id}
              caption={video.snippet.title}
              onSelect={handleVideoCardClick}
              isSelected={video.id === selectedVideoId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
