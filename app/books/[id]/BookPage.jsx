'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';

async function fetchBook(id) {
  const res = await fetch(
    `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mau-books/${id}?acf_format=standard&_fields=id,title,acf,date`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch book');
  }
  return res.json();
}

function addLineBreaks(htmlContent) {
  return htmlContent.replace(/<\/p>/g, '</p><br>');
}

const BookPage = ({ params }) => {
  const [book, setBook] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const shareOptionsRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const getBook = async () => {
      try {
        const fetchedBook = await fetchBook(params.id);
        const updatedContent = {
          ...fetchedBook,
          acf: {
            ...fetchedBook.acf,
            text: addLineBreaks(fetchedBook.acf['text']),
          },
        };
        setBook(updatedContent);
      } catch (error) {
        console.error(error);
      }
    };
    getBook();
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 2000;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      const bottomThreshold = documentHeight - (footerHeight + windowHeight * 2);
  
      if (scrollY > scrollThreshold && scrollY < bottomThreshold) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (showShareOptions && shareOptionsRef.current && !shareOptionsRef.current.contains(event.target)) {
      setShowShareOptions(false);
    }
  }, [showShareOptions]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareOnFacebook = () => {
    const permalink = `https://mautskebeli.wpenginepowered.com/mau-books/${book.id}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(permalink)}`;
    window.open(shareUrl, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(book.title.rendered);
    const pageUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
    window.open(shareUrl, "_blank");
  };

  if (!isMounted || !book) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[54%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="w-full h-auto mb-5">
          <Image
            src={book.acf.image}
            alt={book.title.rendered}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
          <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
            {book.title.rendered}
          </h1>
          <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
            {book.acf['author']}
          </h2>
        </div>
        <div
          className="text-[#474F7A] text-wrap w-full font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal leading-[30px] sm:leading-[35px] tracking-[0.32px]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.acf['text']) }}
        ></div>
        {book.acf['notes'] && (
          <div
            className="prose prose-lg max-w-none mt-10"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.acf['notes']) }}
          ></div>
        )}
        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={() => setShowShareOptions(true)}
            className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-seibold rounded flex gap-[12px] items-center justify-center"
          >
            <Image
              src="/images/share.png"
              alt="share icon"
              width={24}
              height={24}
            />
            გაზიარება
          </button>
        </div>
        {showShareOptions && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div ref={shareOptionsRef} className="rounded-lg p-6 w-80" style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}>
              <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
              <button onClick={shareOnFacebook} className="text-left text-white">
                <Image src="/images/facebook.svg" alt="facebook share" width={44} height={44} />
                Facebook
              </button>
              <button onClick={shareOnTwitter} className="text-left text-white">
                <Image src="/images/twitter.svg" alt="twitter share" width={44} height={44} />
                Twitter
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

export default BookPage;
