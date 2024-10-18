// app/free-column/[id]/ColumnPage.jsx

'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import moment from 'moment';
import 'moment/locale/ka';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'next-share';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

const ColumnPage = ({ article }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (article) {
      let sanitized = DOMPurify.sanitize(article.acf['main-text']);

      // Parse the sanitized HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitized, 'text/html');

      // Add target and rel to external links only
      const links = doc.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          if (href.startsWith('#') || href.startsWith('/')) {
            // Internal link; do nothing
          } else {
            try {
              const linkUrl = new URL(href, window.location.origin);
              if (linkUrl.origin !== window.location.origin) {
                // External link
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
              }
            } catch (e) {
              // If URL parsing fails, treat as internal link
            }
          }
        }
      });

      // Handle blockquote indentation
      const blockquotes = doc.querySelectorAll('blockquote');
      blockquotes.forEach((blockquote) => {
        blockquote.style.marginLeft = '20px'; // Adjust the margin for indentation
        blockquote.style.paddingLeft = '15px'; // Optional padding
        blockquote.style.borderLeft = '5px solid #ccc'; // Optional border style
      });

      // Serialize back to a string
      const updatedContent = doc.body.innerHTML;

      setSanitizedContent(updatedContent);
    }
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 2000;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 100; // assuming footer height
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/images/loader.svg" alt="Loading" />
      </div>
    );
  }

  const formattedDate = formatDate(article.date);

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.path}
              className={`text-sm text-[#474F7A] ${
                category.name === 'თავისუფალი სვეტი'
                  ? 'text-white font-bold'
                  : 'text-[#474F7A] hover:scale-110'
              }`}
            >
              {category.name}
            </a>
          ))}
        </div>
        <div className="w-full h-auto mb-5">
          <Image
            src={article.acf.image || '/images/default-og-image.jpg'}
            alt={article.acf.title || 'Article Image'}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full"
          />
          <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-2">
            {article.acf.title}
          </h1>
          {article.acf.sub_title && (
            <h3 className="font-alk-tall-mtavruli text-[24px] sm:text-[32px] font-light leading-none text-[#474F7A] mt-[12px] mb-5">
              {article.acf.sub_title}
            </h3>
          )}
          {article.acf['ავტორი'] && (
            <h3 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
              {article.acf['ავტორი']}
            </h3>
          )}
          <p className="text-[#474F7A] font-semibold pb-10">{formattedDate}</p>
        </div>
        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px]"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={() => setShowShareOptions(true)}
            className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-semibold rounded flex gap-[12px] items-center justify-center"
          >
            <Image src="/images/share.png" alt="share icon" width={24} height={24} />
          </button>
        </div>
        {showShareOptions && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center"
            onClick={() => setShowShareOptions(false)}
          >
            <div
              className="rounded-lg p-6 w-80"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
              <div className="flex items-center pt-7 gap-5">
                <FacebookShareButton
                  url={`https://www.mautskebeli.ge/free-column/${article.id}`}
                  quote={article.acf.title}
                >
                  <FacebookIcon size={44} round={true} />
                </FacebookShareButton>
                <TwitterShareButton
                  url={`https://www.mautskebeli.ge/free-column/${article.id}`}
                  title={article.acf.title}
                >
                  <TwitterIcon size={44} round={true} />
                </TwitterShareButton>
              </div>
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
      <footer className="h-[100px]"></footer>
    </section>
  );
};

export default ColumnPage;
