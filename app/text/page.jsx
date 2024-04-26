import Image from "next/image"
import Footer from "../components/Footer"
import Link from "next/link"

const page = () => {
  return (
    <>
      <section className='w-10/12 mx-auto flex lg:flex-row flex-col gap-[20px] mt-[100px]'>
        <Link href='/books' className='lg:w-4/12 w-full hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
        <Image
              src="/images/mau-wignebi.svg"
              alt="donation"
              width={270}
              height={180}
            />
            <p>მაუწყებელი წიგნები</p>
        </Link>
        <div className='lg:w-4/12 w-full hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
        <Image
              src="/images/mau-targmani.svg"
              alt="donation"
              width={270}
              height={180}
            />
             <p>თარგმანი</p>
        </div>
        <div className='lg:w-4/12 hover:scale-105 w-full h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
        <Image
              src="/images/mau-statiebi.svg"
              alt="donation"
              width={270}
              height={180}
            />
             <p>სტატიები</p>
        </div>
    
    </section>
    <Footer />
    </>
  
  )
}

export default page