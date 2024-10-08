'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import DOMPurify from 'dompurify';
import moment from 'moment';
import 'moment/locale/ka';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from 'next-share';

const categories = [
  { name: "სტატიები", path: "/all-articles" },
  { name: "თარგმანი", path: "/translate" },
  { name: "მაუწყებელი წიგნები", path: "/books" },
  { name: "თავისუფალი სვეტი", path: "/free-column" },

];

async function fetchArticle(id) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/free-column/${id}?acf_format=standard&_fields=id,acf,date&_=${new Date().getTime()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

function formatDate(dateString) {
  moment.locale('ka');
  return moment(dateString).format('LL');
}

const ColumnPage = ({ params }) => {
  const [article, setArticle] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const shareOptionsRef = useRef(null);
  const footerRef = useRef(null);
  const articleContentRef = useRef(null);
  const { id } = params;

  useEffect(() => {
    setIsMounted(true);
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticle(id);
        setArticle({
          ...fetchedArticle,
          formattedDate: formatDate(fetchedArticle.date),
        });
      } catch (error) {
        console.error(error);
      }
    };
    if (id) {
      getArticle();
    }
  }, [id]);

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

  useEffect(() => {
    if (article && articleContentRef.current) {
      const articleContent = articleContentRef.current;
      articleContent.innerHTML = DOMPurify.sanitize(article.acf['main-text']);

      // Apply styles for blockquotes
      const blockquotes = articleContent.querySelectorAll('blockquote');
      blockquotes.forEach(blockquote => {
        blockquote.style.marginLeft = '20px';
        blockquote.style.marginRight = '20px';
        blockquote.style.paddingLeft = '20px';
        blockquote.style.borderLeft = '5px solid #ccc'; // Example style
      });

      const sanitizedLinks = articleContent.querySelectorAll('a');
      sanitizedLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
        });
      });
    }
  }, [article]);


  useEffect(() => {
    if (article && articleContentRef.current) {
      const articleContent = articleContentRef.current;
      articleContent.innerHTML = DOMPurify.sanitize(article.acf['main-text']);

      const sanitizedLinks = articleContent.querySelectorAll('a');
      sanitizedLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
        });
      });
    }
  }, [article]);

  if (!isMounted || !article) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  const articleUrl = `https://www.mautskebeli.ge/free-column/${article.id}`;
  const ogImage = article.acf.image ? article.acf.image : '/images/default-og-image.jpg';

  const sanitizeDescription = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const ogDescription = sanitizeDescription(article.acf['main-text']).slice(0, 150);

  const currentCategory = "თავისუფალი სვეტი"; 

  return (
    <>
      <Head>
        <title>{article.acf.title}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.acf.title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="fb:app_id" content="1819807585106457" />
      </Head>

      <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
        <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
               
               {categories.map((category) => (
                 <a
                   key={category.name}
                   href={category.path}
                   className={`text-sm  text-[#474F7A] ${
                     category.name === currentCategory
                       ? "text-white font-bold"
                       : "text-[#474F7A]  hover:scale-110"
                   }`}
                 >
                   {category.name}
                 </a>
               ))}
             </div>
          <div className="w-full h-auto mb-5">
            <Image src={article.acf.image || '/images/default-og-image.jpg'} alt={article.acf.title} width={800} height={450} style={{ objectFit: 'cover' }} className="rounded-lg w-full" />
            <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-2">{article.acf.title}</h1>
            <h3 className="font-alk-tall-mtavruli text-[24px] sm:text-[32px] font-light leading-none text-[#474F7A] mt-[12px] mb-5">{article.acf.sub_title}</h3>
            {article.acf['ავტორი'] && (
              <h3 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">{article.acf['ავტორი']}</h3>
            )}
            <p className="text-[#474F7A] font-semibold pb-10">{article.formattedDate}</p>
          </div>
          <div ref={articleContentRef} className="article-content text-[#474F7A] text-wrap w-full font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px]"></div>
          <div className="flex flex-wrap gap-4 mt-10">
            <button onClick={() => setShowShareOptions(true)} className="bg-[#FECE27] text-[#474F7A] pl-[18px] pr-[18px] pt-[4px] pb-[4px] text-[16px] font-seibold rounded flex gap-[12px] items-center justify-center">
              <Image src="/images/share.png" alt="share icon" width={24} height={24} />
            </button>
          </div>
          {showShareOptions && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <div ref={shareOptionsRef} className="rounded-lg p-6 w-80" style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}>
                <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
                <div className="flex items-center pt-7 gap-5">
                  <FacebookShareButton url={articleUrl} quote={article.acf.title}>
                    <FacebookIcon size={44} round={true} />
                  </FacebookShareButton>
                  <TwitterShareButton url={articleUrl} title={article.acf.title}>
                    <TwitterIcon size={44} round={true} />
                  </TwitterShareButton>
                </div>
              </div>
            </div>
          )}
        </div>
        {showScrollButton && (
          <button onClick={scrollToTop} className="fixed bottom-10 right-10 text-[#474F7A] w-[210px] h-[51px] rounded-[100px] inline-flex items-center justify-center gap-[10px]"
            style={{ padding: '25px 32px 28px 32px', background: '#FECE27', boxShadow: '0 0 20px 5px rgba(254, 206, 39, 0.5)' }}>
            <span className="whitespace-nowrap">საწყისზე დაბრუნება</span>
          </button>
        )}
        <footer ref={footerRef} className="h-[100px]"></footer>
      </section>
    </>
  );
};

export default ColumnPage;
