"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import DOMPurify from "dompurify";
import moment from "moment";
import "moment/locale/ka";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from "next-share";

const categories = [
  { name: "სტატიები", path: "/all-articles" },
  { name: "თარგმანი", path: "/translate" },
  { name: "მაუწყებელი წიგნები", path: "/books" },
  { name: "თავისუფალი სვეტი", path: "/free-column" },
];

async function fetchArticle(id) {
  const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date&_=${new Date().getTime()}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error("Failed to fetch article");
  }
  return res.json();
}

function formatDate(dateString) {
  moment.locale("ka");
  return moment(dateString).format("LL");
}

function decodeHTMLEntities(str) {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
}

const ArticlePage = ({ params }) => {
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
          title: {
            ...fetchedArticle.title,
            rendered: decodeHTMLEntities(fetchedArticle.title.rendered),
          },
          formattedDate: formatDate(fetchedArticle.date),
        });
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };
    if (id) {
      getArticle();
    }
  }, [id]);

  useEffect(() => {
    if (article && articleContentRef.current) {
      const articleContent = articleContentRef.current;
      const sanitizedContent = DOMPurify.sanitize(article.acf['main-text'], {
        ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'blockquote', 'a', 'strong', 'em', 'img', 'span', 'div'],  // Allow span and div as well for styling
        ALLOWED_ATTR: ['src', 'alt', 'title', 'width', 'height', 'style'],  // Allow style attribute to retain inline CSS like font size
      });
  
      articleContent.innerHTML = sanitizedContent;
  
      // Handle blockquote styles
      const blockquotes = articleContent.querySelectorAll("blockquote");
      blockquotes.forEach((blockquote) => {
        blockquote.style.marginLeft = "20px";
        blockquote.style.marginRight = "20px";
        blockquote.style.paddingLeft = "20px";
        blockquote.style.borderLeft = "5px solid #ccc";
      });
  
      // Handle links in the content
      const sanitizedLinks = articleContent.querySelectorAll("a");
      sanitizedLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          window.open(link.href, "_blank", "noopener,noreferrer");
        });
      });
    }
  }, [article]);
  
  

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 2000;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      const bottomThreshold =
        documentHeight - (footerHeight + windowHeight * 2);

      if (scrollY > scrollThreshold && scrollY < bottomThreshold) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isMounted || !article) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  const articleUrl = `https://www.mautskebeli.ge/all-articles/${article.id}`;
  const ogImage = article.acf.image
    ? `${article.acf.image}?cb=${new Date().getTime()}`
    : "/images/default-og-image.jpg";

  const sanitizeDescription = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const ogDescription = sanitizeDescription(article.acf["main-text"]).slice(
    0,
    150
  );

  return (
    <>
      <Head>
        <title>{article.title.rendered}</title>
        <meta property="fb:app_id" content="1819807585106457" />
        <meta name="description" content={ogDescription} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title.rendered} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Mautskebeli" />
        <meta property="og:locale" content="ka_GE" />
        <meta property="article:publisher" content="100041686795244" />
        <meta property="og:image:alt" content={article.title.rendered} />
      </Head>

      <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
        <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
          <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.path}
                className={`text-sm  text-[#474F7A] ${
                  category.name === "სტატიები"
                    ? "text-white font-bold"
                    : "text-[#474F7A] hover:scale-110"
                }`}
              >
                {category.name}
              </a>
            ))}
          </div>
          <div className="w-full h-auto mb-5">
            <Image
              src={article.acf.image || "/images/default-og-image.jpg"}
              alt={article.title.rendered}
              width={800}
              height={450}
              style={{ objectFit: "cover" }}
              className="rounded-lg w-full"
            />
            <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
              {article.title.rendered}
            </h1>
            <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
              {article.acf.sub_title}
            </h3>
            <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
              {article.acf["ავტორი"]}
            </h2>
            <p className="text-[#474F7A] font-semibold pb-10">
              {article.formattedDate}
            </p>

            {/* Conditionally display the PDF download link */}
            {article.acf.full_article_pdf && (
              <p className="text-[#474F7A] font-semibold pb-10">
                იხილეთ სტატიის{" "}
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
            ref={articleContentRef}
            className="article-content text-[#474F7A] text-wrap w-full font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px]"
          ></div>
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
            </button>
          </div>
          {showShareOptions && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <div
                ref={shareOptionsRef}
                className="rounded-lg p-6 w-80"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}
              >
                <h2 className="text-xl text-white font-bold mb-4">გააზიარე</h2>
                <div className="flex items-center pt-7 gap-5">
                  <FacebookShareButton
                    url={articleUrl}
                    quote={article.title.rendered}
                  >
                    <FacebookIcon size={44} round={true} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={articleUrl}
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
              padding: "25px 32px 28px 32px",
              background: "#FECE27",
              boxShadow: "0 0 20px 5px rgba(254, 206, 39, 0.5)",
            }}
          >
            <span className="whitespace-nowrap">საწყისზე დაბრუნება</span>
          </button>
        )}
        <footer ref={footerRef} className="h-[100px]"></footer>
      </section>

     
    </>
  );
};

export default ArticlePage;
