"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AlbumSlider from './AlbumSlider';

const PostContent = ({ post, error }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (!window.FB) {
      window.fbAsyncInit = function() {
        FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v13.0'
        });
        console.log('Facebook SDK Initialized');
      };

      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) {
          js = d.createElement(s); js.id = id;
          js.src = "https://connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'facebook-jssdk'));
    }
  }, []);

  const generatePermalink = (postId) => {
    return `https://www.facebook.com/${postId}`;
  };

  const shareOnFacebook = () => {
    const permalink = generatePermalink(post.id);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(permalink)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.message);
    const pageUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnInstagram = () => {
    alert('Instagram sharing is not supported directly via web. Please use Instagram app.');
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="bg-[#FECE27] min-h-screen flex items-center justify-center w-full">
      <div className="bg-[#FECE27] mt-10 rounded-lg shadow-lg p-6 flex flex-col lg:flex-row w-full h-full">
        <div className="lg:w-1/2 h-full sm:w-[100vw] flex items-center justify-center">
          {post.attachments && post.attachments.data && post.attachments.data[0].type === 'album' ? (
            <AlbumSlider message={post.message} post={post} />
          ) : (
            post.attachments && post.attachments.data && post.attachments.data[0].media.image.src && (
              <img
                src={post.attachments.data[0].media.image.src}
                alt="Post Image"
                className="rounded-[6px] h-full object-cover"
              />
            )
          )}
        </div>
        <div className="lg:w-1/2 lg:p-6 sm:p-0 flex flex-col justify-center h-full">
          <div className="flex gap-4">
            <button
              onClick={() => setShowShareOptions(true)}
              className="bg-[#AD88C6] text-[#474F7A] px-4 py-1 sm:py-1 md:py-2 sm:text-sm md:text-lg font-semibold rounded flex gap-2 items-center justify-center"
              style={{ marginTop: '10px' }}
            >
              <Image
                src="/images/share.svg"
                alt="share"
                width={24}
                height={24}
              />
              გაზიარება
            </button>
            <a
              href={generatePermalink(post.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#AD88C6] text-[#474F7A] px-4 py-1 sm:py-1 md:py-2 sm:text-sm md:text-lg font-semibold rounded flex gap-2 whitespace-nowrap items-center justify-center"
              style={{ marginTop: '10px' }}
            >
              <Image
                src="/images/facebook.svg"
                alt="view on facebook"
                width={24}
                height={24}
              />
              იხილე პოსტი
            </a>
          </div>
          {showShareOptions && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <div className="rounded-lg p-6 w-80">
                <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
                <button
                  onClick={shareOnFacebook}
                  className="w-full text-left px-4 py-2 mb-2 text-[#474F7A] bg-white hover:bg-gray-200 rounded"
                >
                  <Image
                    src="/images/facebook.svg"
                    alt="facebook share"
                    width={24}
                    height={24}
                  />
                  Facebook
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="w-full text-left px-4 py-2 text-[#474F7A] bg-white hover:bg-gray-200 rounded"
                >
                  <Image
                    src="/images/twitter.svg"
                    alt="twitter share"
                    width={24}
                    height={24}
                  />
                  Twitter
                </button>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full text-left px-4 py-2 mt-4 text-[#474F7A] bg-white hover:bg-gray-200 rounded"
                >
                  გათიშვა
                </button>
              </div>
            </div>
          )}
          {post.message && <p className="text-lg text-[#474F7A] mb-4 mt-10">{post.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PostContent;
