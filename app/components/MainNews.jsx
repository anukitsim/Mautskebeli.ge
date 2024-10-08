'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMenu } from "../context/MenuContext";

const videoPostTypes = [
  "kalaki",
  "mecniereba",
  "medicina",
  "msoflio",
  "saxli",
  "shroma",
  "xelovneba",
  "ekonomika",
  "resursebi",
  "sporti-videos"
];

const constructUrl = (post) => {
  const { id, post_type, videoId } = post;

  if (videoId) {
    return `/${post_type}?videoId=${videoId}`;
  }

  switch (post_type) {
    case "article":
      return `/all-articles/${id}`;
    case "mau-books":
      return `/books/${id}`;
    default:
      return `/${post_type}/${id}`;
  }
};

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const BulletsNavigation = ({ slides, currentSlide, onSelectSlide }) => {
  return (
    <div className="sm:hidden flex justify-center items-center absolute bottom-0 left-0 right-0 pb-4">
      {slides.map((_, index) => (
        <button
          key={index}
          className={`mx-1 h-2 w-2 rounded-full cursor-pointer ${
            currentSlide === index ? "bg-[#AD88C6]" : "bg-white"
          }`}
          onClick={() => onSelectSlide(index)}
        />
      ))}
    </div>
  );
};

const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 100}`;
};

const MainNews = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const { isMenuOpen } = useMenu();
  const mobileSectionStyle = isMenuOpen ? "top-[calc(32px+40%)]" : "top-32";

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(
          `https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/main-posts?_=${new Date().getTime()}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        let data = await response.json();

        // Sort posts by date to ensure we get the last uploaded
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Fetch additional details for video posts
        const videoDetailsPromises = data
          .filter((post) => videoPostTypes.includes(post.post_type))
          .map(async (post) => {
            try {
              const videoResponse = await fetch(
                `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/${post.post_type}/${post.id}`
              );
              if (videoResponse.ok) {
                const videoData = await videoResponse.json();
                const videoId = extractVideoId(videoData.acf.video_url);
                return { ...post, videoId };
              } else {
                console.error(
                  "Failed to fetch video details:",
                  videoResponse.status
                );
                return post;
              }
            } catch (error) {
              console.error("Error fetching video details:", error);
              return post;
            }
          });

        const videoDetails = await Promise.all(videoDetailsPromises);
        const updatedSlides = data.map((post) => {
          const videoDetail = videoDetails.find(
            (videoPost) => videoPost.id === post.id
          );
          return videoDetail || post;
        });

        // Limit to the latest 5 uploaded slides
        const limitedSlides = updatedSlides.slice(0, 5);

        setSlides(limitedSlides);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSlides();
  }, []);

  // Keyboard navigation event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        prevSlide();
      } else if (event.key === "ArrowRight") {
        nextSlide();
      }
    };

    // Attach the event listener for keydown events
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, slides.length]); // Re-run effect if currentSlide or slides.length changes

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return <img src="/images/loader.svg" alt="Loading" />;
  }

  if (!Array.isArray(slides) || slides.length <= 0) {
    return <p>No main news available</p>;
  }

  return (
    <>
      <section className="lg:block sm:hidden relative w-full h-auto rounded-[16px] bg-gradient-to-b from-black to-black via-transparent overflow-hidden">
        {slides.map((slide, index) => (
          <Link href={constructUrl(slide)} key={slide.id}>
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0"
              }`}
            >
              <Image
                loader={customLoader}
                src={slide.image}
                alt={slide.title}
                layout="fill"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                priority={index === 0} // Preload the first image
                loading={index === 0 ? "eager" : "lazy"} // Lazy load the rest
                quality={100}
              />
                <div className="absolute bottom-5 bg-[#474F7A] bg-opacity-50 w-full  text-white">
                  <h2 className="text-[#FECE27] pl-5 text-[20px] font-extrabold">
                    მთავარი ამბები
                  </h2>
                  <p className="text-[#FFF] pl-5  tracking-normal pt-[10px] font-alk-tall-mtavruli lg:text-[72px] sm:text-[30px] font-light leading-none [text-edge:cap] [leading-trim:both]">
                    {slide.title.split(" ").slice(0, 7).join(" ")}
                    {slide.title.split(" ").length > 7 && "..."}
                  </p>
                </div>
            </div>
          </Link>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image
            src="/images/arrow-left.svg"
            alt="Previous"
            width={50}
            height={50}
          />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20"
        >
          <Image
            src="/images/arrow-right.svg"
            alt="Next"
            width={50}
            height={50}
          />
        </button>
      </section>
      <section
  className={`lg:hidden absolute z-0 left-0 ${mobileSectionStyle} w-full h-[335px]`}
>
  {slides.map((slide, index) => (
    <Link href={constructUrl(slide)} key={slide.id}>
      <div
        className={`absolute  transition-opacity duration-700 ease-in-out ${
          index === currentSlide ? "opacity-100 z-10" : "opacity-0"
        }`}
      >
        <Image
          loader={customLoader}
          src={slide.image}
          alt={slide.title}
          width={1920}
          height={1080}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority={index === 0} // Preload the first image
          loading={index === 0 ? "eager" : "lazy"} // Lazy load the rest
          quality={100}
          layout="responsive"
        />
        {/* Updated styles for text overlay */}
        <div className="absolute bottom-0 bg-[#474F7A] bg-opacity-50 w-full text-white z-20">
          <h2 className="text-[#FECE27] pl-5 text-[10px] pt-2 font-extrabold">
            მთავარი ამბები
          </h2>
          <p className="text-[#FFF] pl-5 tracking-wider pt-[10px] pb-5 font-alk-tall-mtavruli sm:text-[100px] font-light leading-6 [text-edge:cap] [leading-trim:both]">
            {slide.title.split(" ").slice(0, 7).join(" ")}
            {slide.title.split(" ").length > 7 && "..."}
          </p>
        </div>
      </div>
    </Link>
  ))}

  {/* Updated positioning for arrows */}
  <button
    onClick={prevSlide}
    className="absolute left-5 top-[25%] -translate-y-1/2 z-30"
  >
    <Image
      src="/images/arrow-left.svg"
      alt="Previous"
      width={50}
      height={50}
    />
  </button>
  <button
    onClick={nextSlide}
    className="absolute right-5 top-[25%] -translate-y-1/2 z-30"
  >
    <Image
      src="/images/arrow-right.svg"
      alt="Next"
      width={50}
      height={50}
    />
  </button>
</section>

    </>
  );
};

export default MainNews;