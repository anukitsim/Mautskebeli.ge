// app/all-articles/[id]/ENG/ShareButtons.jsx

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'next-share';
import Image from 'next/image';

const ShareButtons = ({ articleId, title }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const modalRef = useRef(null);

  // Close the share modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        </button>
      </div>

      {showShareOptions && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="rounded-lg p-6 w-80"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
          >
            <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
            <div className="flex items-center pt-7 gap-5">
              <FacebookShareButton
                url={`https://www.mautskebeli.ge/all-articles/${articleId}/ENG`}
                quote={title}
              >
                <FacebookIcon size={44} round={true} />
              </FacebookShareButton>
              <TwitterShareButton
                url={`https://www.mautskebeli.ge/all-articles/${articleId}/ENG`}
                title={title}
              >
                <TwitterIcon size={44} round={true} />
              </TwitterShareButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButtons;
