"use client";

import React, { useEffect, useState } from "react";

import Header from "../components/Header";
import Navigation from "../components/Navigation";

const Live = () => {
  const [liveVideos, setLiveVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const pageAccessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  const pageId = "480323335835739";
  const apiVersion = "v13.0";

  useEffect(() => {
    const fetchLiveVideos = async () => {
      setIsLoading(true);
      let nextPageUrl = `https://graph.facebook.com/${apiVersion}/${pageId}/live_videos?fields=id,description,embed_html&access_token=${pageAccessToken}&limit=25`;

      const fetchPage = async (url) => {
        try {
          const response = await fetch(url, {
            next: {
              revalidate: 600,
            },
          });
          const data = await response.json();
          if (data && Array.isArray(data.data)) {
            setLiveVideos((prevVideos) => [...prevVideos, ...data.data]);
          } else {
            console.warn("Unexpected response format:", data);
          }
          if (data.paging && data.paging.next) {
            await fetchPage(data.paging.next);
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Failed to fetch live videos:", error);
          setIsLoading(false);
        }
      };

      await fetchPage(nextPageUrl);
    };

    fetchLiveVideos();
  }, [apiVersion, pageAccessToken, pageId]);

  if (isLoading) {
    return <div className="p-5"><img src="/images/loader.svg" alt="Loading" /></div>;
  }
  console.log(liveVideos);
  return (
    <div className="p-5">
   
      <div className="flex lg:flex-row flex-col w-full mt-4">
        <div className="flex flex-col w-8/12 pr-4">
          <h2 className="text-3xl text-[#474F7A] mb-4 font-bold">მაუწყებელი ფეისბუკი, არქივი</h2>
          {liveVideos.length > 0 && (
            <div
              className="video-container-fb mb-4 border"
              style={{ width: "100%", height: "500px", overflow: "hidden" }}
              dangerouslySetInnerHTML={{
                __html: selectedVideo || liveVideos[0].embed_html,
              }}
            />
          )}
        </div>
        <div className="flex flex-col lg:w-4/12 w-full mt-[3.2rem] overflow-y-auto max-h-[550px]">
          {liveVideos.map((video, index) => (
            <div
              key={video.id + index}
              className="video-card cursor-pointer mb-2 border p-2 hover:bg-[#AD88C6]"
              onClick={() => setSelectedVideo(video.embed_html)}
            >
              <p className="video-title text-sm font-semibold">
                {video.description || "Untitled Video"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Live;