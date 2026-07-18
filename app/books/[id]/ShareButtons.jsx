'use client';

import { useState, useEffect } from 'react';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from 'next-share';
import Image from 'next/image';

const ShareButtons = ({ bookId, title }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.mautskebeli.ge/books/${bookId}`;

  const closeShareOptions = () => {
    setShowShareOptions(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeShareOptions();
      }
    };

    if (showShareOptions) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showShareOptions]);

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-10">
        <button
          onClick={() => setShowShareOptions(true)}
          className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center"
        >
          <Image
            src="/images/share.png"
            alt="share icon"
            width={24}
            height={24}
          />
          {/* You can add text here if needed */}
        </button>
      </div>

      {showShareOptions && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeShareOptions} // Close modal when clicking on the backdrop
        >
          <div
            className="rounded-lg p-6 w-80 relative"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
            <div className="flex items-center pt-7 gap-5">
              <FacebookShareButton url={shareUrl} quote={title}>
                <FacebookIcon size={44} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={title}>
                <TwitterIcon size={44} round />
              </TwitterShareButton>
              <div className="relative">
                <button
                  onClick={handleCopyLink}
                  aria-label="ბმულის კოპირება"
                  className="w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#474F7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5" />
                    <path d="M14 11a5 5 0 00-7.07 0l-2.83 2.83a5 5 0 007.07 7.07l1.5-1.5" />
                  </svg>
                </button>
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    დაკოპირდა!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButtons;
