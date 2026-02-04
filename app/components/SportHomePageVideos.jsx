'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import CustomYoutubePlayer from './CustomYoutube';
import Link from 'next/link';

const decodeHtmlEntities = (text) => {
  if (typeof window === 'undefined') return text || '';
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = String(videoUrl).match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const getThumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const VideoCard = ({ videoId, postId, caption, onSelect, isMobile, index }) => {
  const thumbnailUrl = getThumbnailUrl(videoId);
  const videoPageUrl = `/all-sport-videos/${postId}`;

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
          opacity: 0,
        }}
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={decodeHtmlEntities(caption)}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div
            className="absolute inset-0 flex items-center justify-center
                       bg-gradient-to-t from-black/50 via-black/20 to-transparent
                       opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handlePlayClick}
          >
            <div className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center
                           transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#5F4AA5] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-[#474F7A] text-sm font-bold leading-snug line-clamp-2
                        transition-colors duration-300 group-hover:text-[#5F4AA5] mb-2">
            {decodeHtmlEntities(caption)}
          </h3>
          <div className="flex items-center gap-2 opacity-0 transform translate-y-2
                         group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                           text-[#5F4AA5] bg-[#FECE27]/20 border border-[#FECE27]/40">
              სპორტი
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

function SportHomePageVideos({ compact = false }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (document.getElementById('__next')) {
      Modal.setAppElement('#__next');
    }
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(
          'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/sporti-videos?acf_format=standard&_fields=id,title,acf,date&per_page=4'
        );
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const withVideoId = data
          .map((v) => {
            const url = v.acf?.video_url || v.acf?.video;
            const videoId = extractVideoId(url);
            return videoId ? { ...v, videoId, postId: v.id } : null;
          })
          .filter(Boolean)
          .slice(0, 4);
        setVideos(withVideoId);
      } catch (e) {
        console.error('Error fetching sport videos:', e);
      }
    };
    fetchVideos();
  }, []);

  const handleVideoSelect = useCallback((videoId) => {
    setSelectedVideoId(videoId);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setSelectedVideoId(null);
  }, []);

  const handleModalClick = useCallback((e) => closeModal(), [closeModal]);
  const handleVideoContainerClick = useCallback((e) => e.stopPropagation(), []);

  return (
    <>
      <section className={`mx-auto w-11/12 md:w-10/12 ${compact ? 'mt-0' : 'mt-12 lg:mt-16'}`}>
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-[#FECE27] rounded-full" />
            <h2 className="text-white text-2xl lg:text-3xl font-bold drop-shadow-sm">ვიდეო</h2>
          </div>
          <Link
            href="/all-sport-videos"
            className="text-white/90 text-sm font-semibold hover:text-[#FECE27]
                       transition-colors duration-300 flex items-center gap-2 group"
          >
            <span>ნახე ყველა</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex lg:hidden overflow-x-auto gap-4 hide-scroll-bar pb-4 -mx-4 px-4">
          {videos.map((video, index) => (
            <div key={video.id} className="w-[280px] flex-shrink-0">
              <VideoCard
                videoId={video.videoId}
                postId={video.postId}
                caption={video.title?.rendered || ''}
                onSelect={handleVideoSelect}
                isMobile={isMobile}
                index={index}
              />
            </div>
          ))}
        </div>

        <div className="hidden lg:grid grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              videoId={video.videoId}
              postId={video.postId}
              caption={video.title?.rendered || ''}
              onSelect={handleVideoSelect}
              isMobile={isMobile}
              index={index}
            />
          ))}
        </div>
      </section>

      {selectedVideoId && !isMobile && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Video Modal"
          ariaHideApp={false}
          className="modalContent z-40"
          style={{
            overlay: { zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.85)' },
            content: { outline: 'none' },
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

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default SportHomePageVideos;
