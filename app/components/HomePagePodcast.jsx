import Link from "next/link";
import Image from "next/image";

const HomePagePodcast = () => {
  return (
    <>
     <section className="relative mt-[97px] hidden lg:block">
      {/* Banner image */}
      <Image
        src="/images/podcast-banner.svg"
        alt="Podcast Banner"
        layout="responsive"
        width={700} 
        height={475} 
        quality={100}
      />

      {/* Overlay content */}
      <div className="absolute bottom-0 right-0  flex flex-col justify-center items-center">
        <Link href="https://www.youtube.com/@mautskebeli/podcasts" target="_blank">
          <Image
            src="/images/youtube-banner.png"
            alt="youtube"
            width={558}
            height={184}
            className="px-6 py-3  transition duration-300 hover:scale-105"
          ></Image>
        </Link>
      </div>
      <div className="absolute top-7 right-20 text-white text-[20px] font-bold  flex flex-col justify-center items-center">
        <Link href='ყველა ვიდეო'>ყველა ვიდეო</Link>
      </div>
    </section>
<section className="lg:hidden block relative  mt-[31px]">
<div className="w-[100vw] h-[420px]">
<Image
        src="/images/mobile-banner.png"
        alt="Podcast Banner"
        layout="responsive"
        width={360} 
        height={420} 
        quality={100}
      />

</div>
<div className="absolute top-0 right-5  flex flex-col justify-center items-center">
        <Link href="https://www.youtube.com/@mautskebeli/podcasts" target="_blank">
          <Image
            src="/images/mobile-youtube-banner.png"
            alt="youtube"
            width={558}
            height={184}
            className="px-6 py-3  transition duration-300 hover:scale-105"
          ></Image>
        </Link>
      </div>
      <div className="absolute top-28 left-5 text-white text-[15px] font-bold  flex flex-col justify-center items-center">
        <Link href='ყველა ვიდეო'>ყველა ვიდეო</Link>
      </div>
</section>
    </>
   
  );
};

export default HomePagePodcast;
