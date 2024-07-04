import Image from "next/image"
import Footer from "../components/Footer"
import Link from "next/link"

const page = () => {
  return (
    <>
      <section className='w-10/12 mx-auto flex flex-wrap gap-[20px] justify-center mt-[100px]'>
        <Link href='all-articles' className='w-full md:w-5/12 hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
          <Image
            src="/images/mau-statiebi.svg"
            alt="donation"
            width={270}
            height={180}
          />
          <p>სტატიები</p>
        </Link>
        <Link href='/translate' className='w-full md:w-5/12 hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
          <Image
            src="/images/mau-targmani.svg"
            alt="donation"
            width={270}
            height={180}
          />
          <p>თარგმანი</p>
        </Link>
        <Link href='/books' className='w-full md:w-5/12 hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
          <Image
            src="/images/mau-wignebi.svg"
            alt="donation"
            width={270}
            height={180}
          />
          <p>მაუწყებელი წიგნები</p>
        </Link>
        <Link href='/free-column' className='w-full md:w-5/12 hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
          <Image
            src="/images/column.png"
            alt="donation"
            width={270}
            height={180}
          />
          <p>თავისუფალი სვეტი</p>
        </Link>
      </section>
      <Footer />
    </>
  )
}

export default page
