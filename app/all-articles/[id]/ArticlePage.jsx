"use client";

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
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'სტატიები', path: '/all-articles' },
  { name: 'თარგმანი', path: '/translate' },
  { name: 'მაუწყებელი წიგნები', path: '/books' },
  { name: 'თავისუფალი სვეტი', path: '/free-column' },
];

// Force no caching and refetching the article data
async function fetchArticle(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
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

const ArticlePage = ({ params }) => {
  const [article, setArticle] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { id } = params;

  // Fetch article data on component mount
  useEffect(() => {
    setIsMounted(true);
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticle(id);

        // Ensure correct fetched data for languages
        console.log('Fetched Article:', fetchedArticle);
        console.log('Language1:', fetchedArticle.acf.language1);
        console.log('Language2:', fetchedArticle.acf.language2);

        setArticle({
          ...fetchedArticle,
          title: {
            ...fetchedArticle.title,
            rendered: decodeHTMLEntities(fetchedArticle.title.rendered),
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
  }, [id]); // Refetch when the article ID changes

  useEffect(() => {
    if (article) {
      // Sanitize the fetched content
      let sanitized = DOMPurify.sanitize(article.acf['main-text'], { ADD_ATTR: ['target', 'rel'] });
  
      // Parse the sanitized HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitized, 'text/html');
  
      // Find all anchor tags and add target="_blank" and rel="noopener noreferrer"
      const anchors = doc.querySelectorAll('a');
      anchors.forEach((anchor) => {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      });
  
      // Serialize the modified HTML back into a string
      const modifiedContent = doc.body.innerHTML;
      setSanitizedContent(modifiedContent);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle navigation between languages
  const handleLanguageNavigation = (language) => {
    if (language === 'georgian') {
      router.push(`/all-articles/${id}`);
    } else if (language === 'language1') {
      router.push(`/all-articles/${id}/ENG`);
    } else if (language === 'language2') {
      router.push(`/all-articles/${id}/RU`);
    }
  };

  if (!isMounted || !article) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }


  const currentLanguage = 'georgian';

  // Check if either language1 or language2 is true
  const showLanguageDropdown = article.acf.language1 || article.acf.language2;

  return (
    <>
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
              src={article.acf.image || '/images/default-og-image.jpg'}
              alt={article.title.rendered}
              width={800}
              height={450}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full"
            />
           {/* Language Dropdown (only if language1 or language2 is true) */}
{showLanguageDropdown && (
  <div className="language-selector mt-4">
    <span
      className="cursor-pointer text-[#AD88C6] text-base font-bold"
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      აირჩიე ენა 
      <span className="ml-1 text-sm align-middle">
        {dropdownOpen ? '▼' : '▶'}
      </span>
    </span>
    {dropdownOpen && (
      <div className="flex gap-2 mt-2">
        {['georgian', 'language1', 'language2'].map((language) => {
          const availableLanguages = {
            georgian: 'ქართული',
            language1: 'ინგლისური',
            language2: 'რუსული',
          };
          return (
            <button
              key={language}
              onClick={() => handleLanguageNavigation(language)}
              disabled={language === currentLanguage}
              className={`px-4 py-2 rounded text-sm font-semibold ${
                language === currentLanguage
                  ? 'bg-gray-300 text-[#474F7A] cursor-not-allowed'
                  : 'bg-[#AD88C6] text-[#474F7A] hover:bg-[#AD88C6]'
              }`}
            >
              {availableLanguages[language]}
            </button>
          );
        })}
      </div>
    )}
  </div>
)}


            <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
              {article.title.rendered}
            </h1>
            <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
              {article.acf.sub_title}
            </h3>
            <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
              {article.acf['ავტორი']}
            </h2>
            <p className="text-[#474F7A] font-semibold pb-10">
              {article.formattedDate}
            </p>
            {article.acf.full_article_pdf && (
              <p className="text-[#474F7A] font-semibold pb-10">
                იხილეთ სტატიის{' '}
                <a
                  href={article.acf.full_article_pdf}
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
            className=" w-full article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
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
                className="rounded-lg p-6 w-80"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
              >
                <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
                <div className="flex items-center pt-7 gap-5">
                  <FacebookShareButton
                    url={`https://www.mautskebeli.ge/all-articles/${article.id}`}
                    quote={article.title.rendered}
                  >
                    <FacebookIcon size={44} round={true} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={`https://www.mautskebeli.ge/all-articles/${article.id}`}
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
        .dropdown-opened {
          display: flex;
        }
      `}</style>
    </>
  );
};

export default ArticlePage;
