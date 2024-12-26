"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import PropTypes from "prop-types";

const decodeHTMLEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”");
};

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, "") : "");
const truncateText = (text, limit) =>
  text.split(" ").length > limit
    ? text.split(" ").slice(0, limit).join(" ") + "..."
    : text;

export default function ClientSideBooks({ initialBooks }) {
  const loadMoreRef = useRef(null);

  // Fetcher function
  const fetcher = async (url) => {
    try {
      const response = await fetch(`${url}&_=${new Date().getTime()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return []; // Return an empty array to prevent crashes
    }
  };

  // SWR Infinite Key Function
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && previousPageData.length === 0) return null; // End of pagination
    return `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/mau-books?acf_format=standard&_fields=id,title,acf,date&per_page=20&page=${
      pageIndex + 1
    }`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );

  // Combine all pages of data into a single array
  const books = useMemo(() => (Array.isArray(data) ? data.flat() : initialBooks || []), [data, initialBooks]);

  // Process books for rendering
  const processedBooks = useMemo(() => {
    return books.map((book) => {
      const decodedTitle = decodeHTMLEntities(book?.title?.rendered || "Untitled Book");
      const mainText = truncateText(
        decodeHTMLEntities(stripHtml(book?.acf?.description || "")),
        30
      );

      return {
        ...book,
        title: { rendered: decodedTitle },
        acf: {
          ...book.acf,
          description: mainText,
        },
      };
    });
  }, [books]);

  // Infinite Scroll Effect
  useEffect(() => {
    if (!loadMoreRef.current || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize((prev) => prev + 1); // Load the next page
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [isValidating, setSize]);

  // Error Handling
  if (error) return <div>Error loading books. Please try again later.</div>;

  return (
    <section className="mx-auto flex flex-col overflow-hidden">
      <div className="w-full sm:w-11/12 md:w-10/12 lg:w-10/12 xl:w-9/12 mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-[#474F7A] text-[24px] font-bold mt-5 lg:mt-14 pl-4 lg:pl-2">წიგნები</p>
        </div>
        <p className="text-[#8D91AB] text-wrap pl-4 text-[14px] font-bold lg:pl-2 pt-5 w-11/12 lg:w-9/12 lg:text-justify mb-10">
          წიგნები ხელმისაწვდომია თქვენთვის. შეისწავლეთ კოლექცია.
        </p>

        {isValidating && processedBooks.length === 0 ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {processedBooks.map((book, index) => {
              const imageUrl = book.acf?.image || "/images/default-image.png";

              return (
                <Link href={`/books/${book.id || "unknown"}`} passHref key={book.id || `book-${index}`}>
                  <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                    <div className="relative w-full h-[200px]">
                      <img
                        src={imageUrl}
                        alt="book-cover"
                        className="article-image"
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-[18px]">
                      <h2 className="text-[20px] font-bold mb-2" style={{ color: "#474F7A" }}>
                        {book.title?.rendered}
                      </h2>
                      <span className="text-[#8D91AB] text-[14px] font-bold">
                        {book.acf?.author || "Unknown Author"}
                      </span>
                      <p className="text-sm pt-[18px]" style={{ color: "#000" }}>
                        {book.acf?.description}
                      </p>
                      <div className="flex flex-col justify-end pt-[30px] items-end">
                        <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                          ნახეთ სრულად
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Loading More Indicator */}
        {isValidating && processedBooks.length > 0 && (
          <div ref={loadMoreRef} className="h-10 w-full flex justify-center items-center">
            <img src="/images/loader.svg" alt="Loading more books..." />
          </div>
        )}
      </div>
    </section>
  );
}

ClientSideBooks.propTypes = {
  initialBooks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.shape({
        rendered: PropTypes.string,
      }),
      acf: PropTypes.shape({
        description: PropTypes.string,
        image: PropTypes.string,
        author: PropTypes.string,
      }),
    })
  ),
};
