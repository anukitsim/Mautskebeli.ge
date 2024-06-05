'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';

async function fetchArticle(id) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani/${id}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

function addLineBreaks(htmlContent) {
  return htmlContent.replace(/<\/p>/g, '</p><br>');
}

const ArticlePage = ({ params }) => {
  const [article, setArticle] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticle(params.id);
        const updatedContent = {
          ...fetchedArticle,
          acf: {
            ...fetchedArticle.acf,
            'main-text': addLineBreaks(fetchedArticle.acf['main-text']),
          },
        };
        setArticle(updatedContent);
      } catch (error) {
        console.error(error);
      }
    };
    getArticle();
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      const bottomThreshold = documentHeight - (footerHeight + windowHeight * 2);

      if (scrollY > 200 && scrollY < bottomThreshold) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!window.FB) {
      window.fbAsyncInit = function () {
        console.log(
          'Initializing Facebook SDK with App ID:',
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
        );
        FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v13.0',
        });
        console.log('Facebook SDK Initialized');
      };

      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          console.log('Facebook SDK already loaded');
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        js.onload = function () {
          console.log('Facebook SDK script loaded');
        };
        fjs.parentNode.insertBefore(js, fjs);
      })(document, 'script', 'facebook-jssdk');
    }
  }, []);

  const generatePermalink = (articleId) => {
    return `https://mautskebeli.wpenginepowered.com/targmani/${articleId}`;
  };

  const shareOnFacebook = () => {
    const permalink = generatePermalink(article.id);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(permalink)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(article.title.rendered);
    const pageUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnInstagram = () => {
    alert('Instagram sharing is not supported directly via web. Please use the Instagram app.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isMounted || !article) {
    return <div>Loading...</div>;
  }

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[54%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="w-full h-auto mb-5">
          <Image
            src={article.acf.image}
            alt={article.acf.title}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
          <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
            {article.title.rendered}
          </h1>
          <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
            {article.acf['ავტორი']}
          </h2>
        </div>
        <div
          className="text-[#474F7A] text-wrap w-full font-noto-sans-georgian text-[14px] lg:text-justify sm:text-[16px] font-normal leading-[30px] sm:leading-[35px] tracking-[0.32px]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.acf['main-text']) }}
        ></div>
        {article.acf['შენიშვნები'] && (
          <div
            className="prose prose-lg max-w-none mt-10"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.acf['შენიშვნები']) }}
          ></div>
        )}
        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={() => setShowShareOptions(true)}
            className="bg-[#FECE27]  text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-seibold rounded flex gap-[12px] items-center justify-center"
          >
            <Image
              src="/images/share.png"
              alt="facebook share"
              width={24}
              height={24}
            />
            გაზიარება
          </button>
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
                className="w-full text-left px-4 py-2 mb-2 text-[#474F7A] bg-white hover:bg-gray-200 rounded"
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
      </div>
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 text-[#474F7A] w-[210px] h-[51px] rounded-[100px] inline-flex items-center justify-center gap-[10px]"
          style={{
            padding: '25px 32px 28px 32px',
            background: '#FECE27',
            boxShadow: '0 0 20px 5px rgba(254, 206, 39, 0.5)',
          }}
        >
          <span className="whitespace-nowrap">საწყისზე დაბრუნება</span>
        </button>
      )}
      <footer ref={footerRef} className="h-[100px]"></footer>
    </section>
  );
};

export default ArticlePage;
