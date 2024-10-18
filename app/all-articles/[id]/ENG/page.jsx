"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Head from 'next/head'; // Import for setting meta tags
import DOMPurify from 'dompurify';
import moment from 'moment';
import 'moment/locale/ka';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'next-share';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

async function fetchArticle(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

function decodeHTMLEntities(str) {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent;
}

const Language1Page = ({ params }) => {
  const [article, setArticle] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { id } = params;
  const modalRef = useRef(null); // Create a ref for the share modal

  useEffect(() => {
    setIsMounted(true);
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticle(id);
        setArticle({
          ...fetchedArticle,
          // Use language1 fields here
          title: {
            ...fetchedArticle.acf,
            rendered: decodeHTMLEntities(fetchedArticle.acf.language1_title),
          },
          formattedDate: formatDate(fetchedArticle.date),
        });
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    };
    if (id) {
      getArticle();
    }
  }, [id]);

  useEffect(() => {
    if (article) {
      // Sanitize and parse the language1 main text
      let sanitized = DOMPurify.sanitize(article.acf.language1_main_text);

      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitized, 'text/html');

      const links = doc.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('/') && !href.startsWith('#')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });

      const blockquotes = doc.querySelectorAll('blockquote');
      blockquotes.forEach((blockquote) => {
        blockquote.style.marginLeft = '20px';
        blockquote.style.paddingLeft = '15px';
        blockquote.style.borderLeft = '5px solid #ccc';
      });

      setSanitizedContent(doc.body.innerHTML);
    }
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 2000;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 100;
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle navigation between languages
  const handleLanguageNavigation = (language) => {
    if (language === 'georgian') {
      router.push(`/all-articles/${id}`);
    } else if (language === 'language2') {
      router.push(`/all-articles/${id}/RU`);
    }
  };

  if (!isMounted || !article) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  // Determine which language we're currently viewing
  const currentLanguage = 'language1';

  // Language dropdown options
  const availableLanguages = [
    { key: 'georgian', label: 'Georgian' },
    { key: 'language1', label: 'English' },
    { key: 'language2', label: 'Russian' },
  ];

  // Check if either language1 or language2 exists
  const showLanguageDropdown = article.acf.language1_title || article.acf.language2_title;

  return (
    <>
      {/* Add meta tags dynamically for English */}
      <Head>
        <title>{article.acf.language1_title} - English Version</title>
        <meta
          name="description"
          content={article.acf.language1_sub_title || 'An article in English.'}
        />
        <meta property="og:title" content={article.acf.language1_title} />
        <meta property="og:description" content={article.acf.language1_sub_title} />
        <meta
          property="og:image"
          content={article.acf.language1_image || '/images/default-og-image.jpg'}
        />
        <meta property="og:url" content={`https://www.mautskebeli.ge/all-articles/${article.id}/ENG`} />
        <meta name="twitter:title" content={article.acf.language1_title} />
        <meta name="twitter:description" content={article.acf.language1_sub_title} />
      </Head>

      <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
        <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
          <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.path}
                className={`text-sm text-[#474F7A] ${
                  category.name === 'სტატიები'
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
              src={article.acf.language1_image || '/images/default-og-image.jpg'}
              alt={article.title.rendered}
              width={800}
              height={450}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full"
            />

              {/* Language Dropdown (only if language1 or language2 is present) */}
{showLanguageDropdown && (
  <div className="language-selector mt-4">
    <span
      className="cursor-pointer text-[#AD88C6] text-base font-bold"
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      Choose language 
      <span className="ml-1 text-sm align-middle">
        {dropdownOpen ? '▼' : '▶'}
      </span>
    </span>
    {dropdownOpen && (
      <div className="flex gap-2 mt-2">
        {availableLanguages.map((language) => (
          <button
            key={language.key}
            onClick={() => handleLanguageNavigation(language.key)}
            disabled={language.key === currentLanguage}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              language.key === currentLanguage
                ? 'bg-gray-300 text-[#474F7A]  cursor-not-allowed'
                : 'bg-[#AD88C6] text-[#474F7A]  hover:bg-[#AD88C6]'
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>
    )}
  </div>
)}
            <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
              {article.title.rendered}
            </h1>
            <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
              {article.acf.language1_sub_title}
            </h3>
            <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
              {article.acf.language1_ავტორი}
            </h2>
            <p className="text-[#474F7A] font-semibold pb-10">
              {article.formattedDate}
            </p>
            {article.acf.language1_pdf && (
              <p className="text-[#474F7A] font-semibold pb-10">
                იხილეთ სტატიის{' '}
                <a
                  href={article.acf.language1_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="underline"
                >
                  პდფ ვერსია
                </a>
              </p>
            )}
          </div>

          <div
            className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          ></div>

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
                ref={modalRef}  // Reference to the modal
                className="rounded-lg p-6 w-80"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
              >
                <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
                <div className="flex items-center pt-7 gap-5">
                  <FacebookShareButton
                    url={`https://www.mautskebeli.ge/all-articles/${article.id}/ENG`}
                    quote={article.title.rendered}
                  >
                    <FacebookIcon size={44} round={true} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={`https://www.mautskebeli.ge/all-articles/${article.id}/ENG`}
                    title={article.title.rendered}
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

      <style jsx>{`
        .language-selector {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
};

export default Language1Page;
