import Link from "next/link";
import Image from "next/image";

const HomePagePodcast = () => {
  return (
    <>
      <section className="relative mt-[97px] w-full">
        {/* Banner image */}
        <div className="relative w-full">
          <Link href='/podcast'>
            <Image
              src="/images/podcast-banner.svg"
              alt="Podcast Banner"
              layout="responsive"
              width={1920}  // Adjust these values based on your original image dimensions
              height={475} // This maintains the aspect ratio
              quality={100}
              priority
            />
          </Link>
        </div>

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
          >
            <Image
              src="/images/youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="transition duration-300 hover:scale-105"
            />
          </Link>
        </div>
      </section>

      <section className="lg:hidden block relative mt-[31px]">
        <div className="relative w-full">
          <Link href='/podcast'>
          <Image
            src="/images/mobile-banner.png"
            alt="Podcast Banner"
            layout="responsive"
            width={800}  // Adjust these values based on your mobile image dimensions
            height={420} // This maintains the aspect ratio
            quality={100}
            priority
          />
          </Link>
          
        </div>
        <div className="absolute top-0 right-5 flex justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
          >
            <Image
              src="/images/mobile-youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="transition duration-300 hover:scale-105"
            />
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePagePodcast;
