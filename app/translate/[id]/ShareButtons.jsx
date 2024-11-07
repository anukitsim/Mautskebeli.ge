'use client';

import { useState, useEffect } from 'react';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from 'next-share';
import Image from 'next/image';

const ShareButtons = ({ articleId, title }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShareOptions]);

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-10">
        <button onClick={() => setShowShareOptions(true)} className="bg-[#FECE27] text-[#474F7A] px-4 py-2 text-[16px] font-semibold rounded flex gap-2 items-center justify-center">
          <Image src="/images/share.png" alt="share icon" width={24} height={24} />
        </button>
      </div>

      {showShareOptions && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareOptions(false)}>
          <div className="rounded-lg p-6 w-80 relative" style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
            <div className="flex items-center pt-7 gap-5">
              <FacebookShareButton url={`https://www.mautskebeli.ge/translate/${articleId}`} quote={title}>
                <FacebookIcon size={44} round />
              </FacebookShareButton>
              <TwitterShareButton url={`https://www.mautskebeli.ge/translate/${articleId}`} title={title}>
                <TwitterIcon size={44} round />
              </TwitterShareButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButtons;
