"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import CustomYoutubePlayer from "./CustomYoutube";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Share icon components (inline SVGs for crisp, professional look)
const IconYouTube = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const IconFacebook = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconTwitter = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconLink = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

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

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const getThumbnailUrl = (videoId) => {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

// Skeleton loading — matches podcast layout (player + meta left, sidebar right), same style as news page
const PodcastLoadingSkeleton = () => (
  <div className="w-full px-4 pb-12">
    <div className="max-w-[1280px] mx-auto pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
        {/* Left: player + title + description + share */}
        <div className="min-w-0 animate-pulse">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#E8E0EE] via-[#F6F4F8] to-[#E8E0EE] bg-[length:200%_100%] animate-shimmer"
            />
          </div>
          <div className="mt-6 lg:mt-8 space-y-3">
            <div className="h-7 bg-[#E8E0EE] rounded w-4/5" />
            <div className="h-7 bg-[#E8E0EE] rounded w-full" />
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-[#E8E0EE] rounded w-full" />
              <div className="h-4 bg-[#E8E0EE] rounded w-full" />
              <div className="h-4 bg-[#E8E0EE] rounded w-5/6" />
              <div className="h-4 bg-[#E8E0EE] rounded w-4/5" />
              <div className="h-4 bg-[#E8E0EE] rounded w-3/4" />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <div className="h-11 bg-[#E8E0EE] rounded-xl w-48" />
              <div className="h-10 bg-[#E8E0EE] rounded-full w-10" />
              <div className="h-10 bg-[#E8E0EE] rounded-full w-10" />
              <div className="h-10 bg-[#E8E0EE] rounded-full w-10" />
            </div>
          </div>
        </div>
        {/* Right: sidebar list */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-7 bg-[#E8E0EE] rounded-full animate-pulse" />
            <div className="h-4 bg-[#E8E0EE] rounded w-32 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-3 p-2 rounded-xl">
                <div className="w-[120px] h-[68px] bg-[#E8E0EE] rounded-lg flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-[#E8E0EE] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[#E8E0EE] rounded w-4/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Mobile skeleton row */}
    <div className="lg:hidden max-w-[1280px] mx-auto mt-10 px-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-7 bg-[#E8E0EE] rounded-full animate-pulse" />
        <div className="h-5 bg-[#E8E0EE] rounded w-36 animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[280px] flex-shrink-0 animate-pulse">
            <div className="aspect-video bg-[#E8E0EE] rounded-xl" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-[#E8E0EE] rounded w-full" />
              <div className="h-3 bg-[#E8E0EE] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer {
        animation: shimmer 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);

// Professional share block: below description (left column). Compact on mobile.
const ShareBlock = ({ videoId, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const copyLink = useCallback(() => {
    if (!videoId) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [videoId]);

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: IconFacebook,
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
      icon: IconTwitter,
    },
  ];

  if (!videoId) return null;

  return (
    <div className={compact ? "flex flex-col gap-4" : "rounded-2xl border border-[#E0DBE8] bg-[#F9F8FA] p-5 lg:p-6"}>
      <a
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#FECE27] text-[#474F7A] font-semibold text-[15px] hover:bg-[#F5D84A] hover:shadow-md active:scale-[0.98] transition-all duration-200"
      >
        <IconYouTube />
        YouTube-ზე გადასვლა
      </a>
      <div className={compact ? "flex flex-wrap items-center gap-3" : "pt-4 mt-4 border-t border-[#E0DBE8]/60 flex items-center flex-wrap gap-3"}>
        <span className="text-[#6B7280] text-sm font-medium">
          გაზიარება
        </span>
        <div className="flex items-center gap-2">
          {shareLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full border border-[#E0DBE8] bg-white flex items-center justify-center text-[#474F7A] hover:border-[#AD88C6]/50 hover:bg-[#AD88C6]/10 hover:text-[#AD88C6] transition-colors duration-200"
            >
              <Icon />
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
            className="w-10 h-10 rounded-full border border-[#E0DBE8] bg-white flex items-center justify-center text-[#474F7A] hover:border-[#AD88C6]/50 hover:bg-[#AD88C6]/10 hover:text-[#AD88C6] transition-colors duration-200"
            title={copied ? "Copied!" : "Copy link"}
          >
            <IconLink />
          </button>
          {copied && (
            <span className="text-xs text-[#AD88C6] font-medium animate-pulse">
              კოპირებულია
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar episode row: thumbnail + title, for "other episodes" list (YouTube-style)
const SidebarEpisodeItem = ({ video, channelId, isActive, onSelect }) => {
  const href = `/podcast?chId=${channelId}&videoId=${video.id}`;
  const thumbnailUrl = getThumbnailUrl(video.id);
  const decodeTitle = (text) => {
    if (!text) return '';
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
  };
  const title = decodeTitle(video.snippet?.title);

  return (
    <Link
      href={href}
      onClick={() => onSelect(video.id)}
      className={`flex gap-3 p-2 rounded-xl transition-colors duration-200 group ${
        isActive
          ? "bg-[#AD88C6]/15 border border-[#AD88C6]/40"
          : "hover:bg-[#E0DBE8]/30 border border-transparent"
      }`}
    >
      <div className="relative w-[120px] h-[68px] flex-shrink-0 rounded-lg overflow-hidden bg-[#E0DBE8]/40">
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="120px"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#AD88C6] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <p className="text-[13px] font-medium text-[#474F7A] line-clamp-2 leading-snug group-hover:text-[#AD88C6] transition-colors">
          {title}
        </p>
      </div>
    </Link>
  );
};

// Card for mobile horizontal scroll / grid (unchanged)
const VideoCard = ({ videoId, caption, onSelect, channelId, index }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);
  const href = `/podcast?chId=${channelId}&videoId=${videoId}`;

  const decodeCaption = (text) => {
    if (!text) return '';
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
  };

  return (
    <Link href={href} className="group block" onClick={() => onSelect(videoId)}>
      <article
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl
                   transition-all duration-500 transform hover:-translate-y-2
                   border border-[#E0DBE8]/30 h-full"
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'slideUp 0.6s ease-out forwards',
          opacity: 0
        }}
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={decodeCaption(caption)}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div
            className="absolute inset-0 flex items-center justify-center
                       bg-gradient-to-t from-black/50 via-black/20 to-transparent
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center
                           transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#AD88C6] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2
                        transition-colors duration-300 group-hover:text-[#AD88C6]">
            {decodeCaption(caption)}
          </h3>
        </div>
      </article>
    </Link>
  );
};

const Podcast = () => {
  const searchParams = useSearchParams();
  const idInQueryParams = searchParams.get("chId");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLive, setIsLive] = useState(false);
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
        let allItems = [];
        let nextPageToken = null;

        do {
          const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
          url.searchParams.set("part", "snippet");
          url.searchParams.set("maxResults", "50");
          url.searchParams.set("playlistId", playlistId);
          url.searchParams.set("key", apiKey);
          if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

          const playlistResponse = await fetch(url.toString());
          if (!playlistResponse.ok) {
            throw new Error("Failed to fetch videos from the playlist");
          }

          const playlistData = await playlistResponse.json();
          allItems = allItems.concat(playlistData.items || []);
          nextPageToken = playlistData.nextPageToken || null;
        } while (nextPageToken);

        const playlistVideos = allItems.map((item) => ({
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
    return <PodcastLoadingSkeleton />;
  }

  return (
    <>
      <div className="w-full px-4 pb-12">
        {videos.length > 0 && (
          <>
            {isLive && selectedVideoId === liveStream?.id && (
              <div className="max-w-[1280px] mx-auto px-2">
                <h1 className="text-[#FECE27] text-[20px] font-extrabold mt-5 mb-4 animate-pulse">
                  პირდაპირი ეთერი
                </h1>
              </div>
            )}

            {/* Podcast format: left = player + meta + share below; right = other episodes (sidebar) */}
            <div
              className="max-w-[1280px] mx-auto pt-8"
              style={{
                animation: "slideUp 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
                {/* Left: player → title → description → share (all below) */}
                <div ref={mainVideoRef} className="min-w-0">
                  <div className="rounded-2xl overflow-hidden">
                    <CustomYoutubePlayer
                      key={customPlayerKey}
                      videoId={selectedVideoId ? selectedVideoId : videos[0].id}
                      onClose={() => setSelectedVideoId("")}
                      videoData={videos.find((video) => video.id === selectedVideoId)}
                    />
                  </div>
                  <div className="mt-6 lg:mt-8">
                    <h2 className="text-[24px] lg:text-[30px] text-[#474F7A] font-bold leading-tight">
                      {videos.find((video) => video.id === selectedVideoId)?.snippet?.title || ""}
                    </h2>
                    <p className="text-[15px] text-[#474F7A]/90 font-light mt-3 leading-relaxed line-clamp-6 lg:line-clamp-none">
                      {videos.find((video) => video.id === selectedVideoId)?.snippet?.description || ""}
                    </p>
                    {/* Share below description (desktop + mobile) */}
                    <div className="mt-6">
                      <ShareBlock videoId={selectedVideoId} compact />
                    </div>
                  </div>
                </div>

                {/* Right: other episodes — scrollable sidebar (desktop only) */}
                <aside className="hidden lg:block sticky top-24">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-7 bg-[#AD88C6] rounded-full" />
                    <h3 className="text-[#474F7A] text-base font-bold">სხვა ეპიზოდები</h3>
                  </div>
                  <div className="max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden pr-1 space-y-1.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#E0DBE8]/20 [&::-webkit-scrollbar-thumb]:bg-[#AD88C6]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {videos.map((video) => (
                      <SidebarEpisodeItem
                        key={video.id}
                        video={video}
                        channelId={channelId}
                        isActive={video.id === selectedVideoId}
                        onSelect={handleVideoCardClick}
                      />
                    ))}
                  </div>
                </aside>
              </div>
            </div>

            {/* Mobile: other episodes — horizontal scroll below */}
            <div
              className="lg:hidden max-w-[1280px] mx-auto mt-10 px-2"
              style={{
                animation: "slideUp 0.6s ease-out forwards",
                animationDelay: "120ms",
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-7 bg-[#AD88C6] rounded-full" />
                <h3 className="text-[#474F7A] text-lg font-bold">სხვა ეპიზოდები</h3>
              </div>
              <div className="flex overflow-x-auto hide-scroll-bar gap-4 pb-4 -mx-4 px-4">
                {videos.map((video, index) => (
                  <div key={video.id} className="w-[280px] flex-shrink-0">
                    <VideoCard
                      videoId={video.id}
                      caption={video.snippet.title}
                      onSelect={handleVideoCardClick}
                      channelId={channelId}
                      index={index}
                    />
                  </div>
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
