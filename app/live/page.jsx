import Image from "next/image"
import Link from "next/link"

// Force dynamic rendering (required for client-side context in layout)
export const dynamic = 'force-dynamic'

const page = () => {
  return (
    <>
    <section className='w-10/12 mx-auto flex lg:flex-row flex-col justify-center gap-[20px] mt-[100px]'>
       <Link href='/podcast' className='lg:w-4/12 w-full hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
        <Image
              src="/images/podcast.png"
              alt="donation"
              width={270}
              height={180}
            />
            <p>მაუწყებელი პოდკასტი</p>
        </Link>
        <Link href='/facebook-live' className='lg:w-4/12 w-full hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
        <Image
              src="/images/fb-live.png"
              alt="donation"
              width={270}
              height={180}
            />
             <p>მაუწყებელი ფეისბუქზე</p>
        </Link>
    </section>
    </>
    
  )
}

export default page
