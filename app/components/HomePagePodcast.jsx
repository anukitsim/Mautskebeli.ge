import Link from "next/link";
import Image from "next/image";

const HomePagePodcast = () => {
  return (
    <>
      <section className="relative mt-[97px] hidden lg:block">
        {/* Banner image */}
        <div className="relative w-full h-[475px]">
          <Link href='/podcast'>
            <Image
              src="/images/podcast-banner.svg"
              alt="Podcast Banner"
              fill
              quality={100}
              style={{ objectFit: "cover" }}
              priority
            />
          </Link>
        </div>

        {/* Overlay content */}
        <div className="absolute bottom-0 right-0 flex flex-col justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
          >
            <Image
              src="/images/youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="px-6 py-3 transition duration-300 hover:scale-105"
            />
          </Link>
        </div>
      </section>

      <section className="lg:hidden block relative mt-[31px]">
        <div className="relative w-[100vw] h-[420px]">
          <Link href='/podcast'>
          <Image
            src="/images/mobile-banner.png"
            alt="Podcast Banner"
            fill
            quality={100}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
          </Link>
          
        </div>
        <div className="absolute top-0 right-5 flex flex-col justify-center items-center">
          <Link
            href="https://www.youtube.com/playlist?list=PL8wF1aEA4P8NJZUazilLH7ES-T-RQd3Cy"
            target="_blank"
          >
            <Image
              src="/images/mobile-youtube-banner.png"
              alt="youtube"
              width={558}
              height={184}
              className="px-6 py-3 transition duration-300 hover:scale-105"
            />
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePagePodcast;
