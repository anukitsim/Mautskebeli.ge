import Link from "next/link";
import Image from "next/image";

const HomePagePodcast = () => {
  return (
    <>
      {/* Desktop Banner */}
      <section className="relative mt-[97px] w-full hidden lg:block">
        <div className="relative w-full">
          <Link href='/podcast'>
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

      {/* Mobile Banner */}
      <section className="relative mt-[101px] w-full lg:hidden">
        <div className="relative w-full">
          <Link href='/podcast'>
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
          >
            <Image
              src="/images/.png"
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
