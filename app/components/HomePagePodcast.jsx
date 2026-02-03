import Link from "next/link";
import Image from "next/image";

const HomePagePodcast = () => {
  return (
    <>
      {/* Desktop Banner */}
      <section className="relative w-full hidden lg:block group overflow-hidden">
        <div className="relative w-full transition-transform duration-700">
          <Link href="/podcast">
            <Image
              src="/images/podcast-banner.svg"
              alt="Podcast Banner"
              layout="responsive"
              width={1920}
              height={475}
              quality={100}
              priority
            />
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
            className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <Image
              src="/images/youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="drop-shadow-lg"
            />
          </Link>
        </div>
      </section>

      {/* Mobile Banner */}
      <section className="relative w-full lg:hidden overflow-hidden">
        <div className="relative w-full">
          <Link href="/podcast">
            <Image
              src="/images/mobile-banner.png"
              alt="Podcast Banner"
              layout="responsive"
              width={800}
              height={420}
              quality={100}
              priority
            />
          </Link>
        </div>
        <div className="absolute top-10 right-5 flex justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
            className="transform transition-all duration-300 hover:scale-105"
          >
            <Image
              src="/images/mobile-youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="drop-shadow-md"
            />
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePagePodcast;
