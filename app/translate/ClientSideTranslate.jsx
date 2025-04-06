"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import { mutate } from "swr";
import PropTypes from "prop-types";

/**
 * Decode some common HTML entities.
 */
function decodeHTMLEntities(text) {
  if (!text) return "";
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”");
}

/**
 * Strip out all HTML tags.
 */
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Truncate text by word count.
 */
function truncateText(text, limit) {
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}

export default function ClientSideTranslate({ initialTranslations }) {
  const loadMoreRef = useRef(null);

  /**
   * Simple fetcher with timestamp to avoid caching issues
   */
  const fetcher = (url) =>
    fetch(`${url}&_=${new Date().getTime()}`).then((res) => res.json());

  /**
   * SWR infinite key for pagination
   * - Notice: no _fields param, so ACF returns all fields (including "მთარგმნელი").
   */
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;
    return `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani?acf_format=standard&per_page=10&page=${
      pageIndex + 1
    }`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  /**
   * Flatten all pages into a single array
   */
  const translations = useMemo(() => {
    if (Array.isArray(data)) {
      return data.flat();
    }
    return initialTranslations || [];
  }, [data, initialTranslations]);

  /**
   * Prepare each translation for display
   */
  const processedTranslations = useMemo(() => {
    return translations.map((translation) => {
      // Decode the title
      const decodedTitle = decodeHTMLEntities(
        translation.title?.rendered || "Untitled Translation"
      );
      // Truncate the main text for preview
      const mainTextRaw = translation.acf?.["main-text"] || "";
      const mainText = truncateText(
        decodeHTMLEntities(stripHtml(mainTextRaw)),
        30
      );

      return {
        ...translation,
        title: { rendered: decodedTitle },
        acf: {
          ...translation.acf,
          // Overwrite the "main-text" with truncated excerpt
          "main-text": mainText,
        },
      };
    });
  }, [translations]);

  /**
   * Intersection Observer for auto-loading the next page
   */
  useEffect(() => {
    if (!loadMoreRef.current || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isValidating, setSize]);

  /**
   * Optional manual refresh function
   */
  const refreshTranslations = () => {
    mutate(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani`);
  };

  if (error) {
    return <div>Error loading translations.</div>;
  }

  return (
    <section className="mx-auto flex flex-col overflow-hidden">
      <div className="w-full sm:w-11/12 md:w-10/12 lg:w-10/12 xl:w-9/12 mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-[#474F7A] text-[24px] font-bold mt-5 lg:mt-14 pl-4 lg:pl-2">
            თარგმანი
          </p>
        </div>

        <p className="text-[#8D91AB] text-wrap pl-4 text-[14px] font-bold lg:pl-2 pt-5 w-11/12 lg:w-9/12 lg:text-justify mb-10">
          გთავაზობთ სხვადასხვა თემატიკის თარგმანებს.
        </p>

        {/* If still loading first page */}
        {isValidating && processedTranslations.length === 0 ? (
          <div className="flex justify-center items-center mt-10">
            <img src="/images/loader.svg" alt="Loading" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 mx-4 lg:mx-0">
            {processedTranslations.map((translation, index) => {
              // Fallback image
              const imageUrl =
                translation.acf?.image || "/images/default-image.png";

              return (
                <Link
                  href={`/translate/${translation.id}`}
                  key={translation.id || `translation-${index}`}
                  passHref
                >
                  <div className="bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden cursor-pointer">
                    <div className="relative w-full h-[200px]">
                      <img
                        src={imageUrl}
                        alt="translation-cover"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-[18px]">
                      <h2
                        className="text-[20px] font-bold mb-2"
                        style={{ color: "#474F7A" }}
                      >
                        {translation.title?.rendered}
                      </h2>

                      <div>
                        {/* Primary author (ავტორი) */}
                        <span className="text-[#8D91AB] text-[14px] font-bold">
                          {translation.acf?.["ავტორი"] || "Unknown Author"}
                        </span>

                        {/* Translator (მთარგმნელი) below the author if present */}
                        {translation.acf?.["მთარგმნელი"] && (
                          <span className="text-[#8D91AB] text-[14px] font-bold block">
                            {translation.acf["მთარგმნელი"]}
                          </span>
                        )}
                      </div>

                      <p className="text-sm pt-[18px]" style={{ color: "#000" }}>
                        {translation.acf?.["main-text"]}
                      </p>

                      <div className="flex flex-col justify-end pt-[30px] items-end">
                        <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] py-[10px] px-[12px]">
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

        {/* Infinite scroll loader after first page */}
        {isValidating && processedTranslations.length > 0 && (
          <div
            ref={loadMoreRef}
            className="h-10 w-full flex justify-center items-center"
          >
            <img src="/images/loader.svg" alt="Loading more translations" />
          </div>
        )}
        {/* Sentinel element for intersection observer */}
        {!isValidating && <div ref={loadMoreRef} className="h-10 w-full" />}
      </div>
    </section>
  );
}

ClientSideTranslate.propTypes = {
  initialTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.shape({
        rendered: PropTypes.string,
      }),
      acf: PropTypes.shape({
        image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        "main-text": PropTypes.string,
        "ავტორი": PropTypes.string,
        "მთარგმნელი": PropTypes.string,
      }),
    })
  ),
};
