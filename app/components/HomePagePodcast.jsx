import Link from "next/link"

const HomePagePodcast = () => {
  return (
    <section className='w-[100vw] h-[70vh] mt-[85px] bg-[url("/images/podcast-banner.svg")] bg-cover bg-center bg-no-repeat'>
      <p className="flex justify-end text-[20px] font-bold text-white" style={{paddingTop: '10px'}}>ყველა ვიდეო</p>
      {/* Link and Image component is commented out, uncomment if needed */}
      {/* <Link href='https://www.youtube.com/@mautskebeli/podcasts' target='_blank' className='absolute bottom-2 right-20 z-50'>
      <Image src='/images/youtube-banner.png' alt='youtube' width={558} height={184} />
      </Link> */}
    </section>
  )
}

export default HomePagePodcast
