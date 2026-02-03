'use client';

import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import Image from "next/image";
import CustomYoutubePlayer from "./CustomYoutube";
import Link from "next/link";

// Category color mapping - same as news section
const categoryColors = {
  'mecniereba': { bg: '#5B2C6F', label: 'მეცნიერება' },
  'medicina': { bg: '#C0392B', label: 'მედიცინა' },
  'msoflio': { bg: '#1E3A5F', label: 'მსოფლიო' },
  'saxli': { bg: '#9B59B6', label: 'სახლი ყველას' },
  'kalaki': { bg: '#1ABC9C', label: 'ქალაქი' },
  'shroma': { bg: '#E74C3C', label: 'შრომა' },
  'xelovneba': { bg: '#D35400', label: 'ხელოვნება' },
  'resursebi': { bg: '#3498DB', label: 'რესურსები' },
  'ekonomika': { bg: '#2D5A27', label: 'ეკონომიკა' },
  'default': { bg: '#AD88C6', label: 'ვიდეო' }
};

// Utility function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (typeof window === 'undefined') return text || '';
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Video Card - matching news section style
const VideoCard = ({ videoId, caption, onSelect, postType, isMobile, index }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);
  const category = categoryColors[postType] || categoryColors.default;
  const videoPageUrl = `/${postType}?videoId=${videoId}`;

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobile) {
      onSelect(videoId);
    } else {
      window.location.href = videoPageUrl;
    }
  };

  return (
    <Link href={videoPageUrl} className="group block">
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
        {/* Image container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={decodeHtmlEntities(caption)}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          

          {/* Play button overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center 
                       bg-gradient-to-t from-black/50 via-black/20 to-transparent 
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handlePlayClick}
      >
            <div className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center
                           transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#AD88C6] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2 
                        transition-colors duration-300 group-hover:text-[#AD88C6] mb-2">
            {decodeHtmlEntities(caption)}
          </h3>

          {/* Category badge - appears on hover */}
          <div className="flex items-center gap-2 opacity-0 transform translate-y-2 
                         group-hover:opacity-100 group-hover:translate-y-0 
                         transition-all duration-300">
            <span 
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                         text-[#AD88C6] bg-[#AD88C6]/10 border border-[#AD88C6]/30"
            >
              {category.label}
            </span>
          </div>
      </div>
      </article>
      </Link>
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

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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
      {/* Section Header - matching news section */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-[#AD88C6] rounded-full" />
          <h2 className="text-[#474F7A] text-2xl lg:text-3xl font-bold">ვიდეო</h2>
        </div>
        <Link 
          href="/all-videos" 
          className="text-[#474F7A] text-sm font-semibold hover:text-[#AD88C6] 
                     transition-colors duration-300 flex items-center gap-2 group"
        >
          <span>ნახე ყველა</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="flex lg:hidden overflow-x-auto gap-4 hide-scroll-bar pb-4 -mx-4 px-4">
        {latestVideos.map((video, index) => (
          <div key={video.id} className="w-[280px] flex-shrink-0">
            <VideoCard
              videoId={extractVideoId(video.acf.video_url)}
              caption={video.title.rendered}
              onSelect={handleVideoSelect}
              postType={video.post_type}
              isMobile={isMobile}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Desktop Grid - 4 columns like news section */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {latestVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            videoId={extractVideoId(video.acf.video_url)}
            caption={video.title.rendered}
            onSelect={handleVideoSelect}
            postType={video.post_type}
            isMobile={isMobile}
            index={index}
          />
        ))}
      </div>

      {/* Video Modal */}
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
              backgroundColor: "rgba(0, 0, 0, 0.85)",
            },
            content: {
              outline: 'none'
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
            className="absolute top-4 right-4 lg:top-10 lg:right-10 z-50 
                       w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 
                       flex items-center justify-center transition-colors duration-300"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Modal>
      )}

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default HomePageVideos;
