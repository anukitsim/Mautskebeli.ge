import { getLang } from "@/utils/i18n/server";
import { translateUi } from "@/utils/i18n/dictionary";
import { localizePath } from "@/utils/i18n/paths";
import Image from "next/image"
import Footer from "../components/Footer"
import Link from "next/link"

const page = () => {
  const lang = getLang();
  const t = (ka) => translateUi(lang, ka);
  const localize = (path) => localizePath(path, lang);
  return (
    <>
      <section className='w-10/12 mx-auto flex flex-wrap gap-[20px] justify-center mt-[100px]'>
        <Link href='all-articles' className='w-full md:w-5/12 hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
          <Image
            src="/images/articles.png"
            alt="donation"
            width={270}
            height={180}
          />
          <p>{t("სტატიები")}</p>
        </Link>
        <Link href='/translate' className='w-full md:w-5/12 hover:scale-105 h-[280px] flex-col rounded-[16px] border border-[#E0DBE8] flex justify-center items-center'>
          <Image
            src="/images/targmani.png"
            alt="donation"
            width={270}
            height={180}
          />
          <p>{t("თარგმანი")}</p>
        </Link>
        <Link href='/books' className='w-full md:w-5/12 hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
          <Image
            src="/images/wignebi-art.png"
            alt="donation"
            width={270}
            height={180}
          />
          <p>{t("მაუწყებელი წიგნები")}</p>
        </Link>
        <Link href='/free-column' className='w-full md:w-5/12 hover:scale-105 h-[280px] rounded-[16px] border border-[#E0DBE8] flex flex-col justify-center items-center'>
          <Image
            src="/images/sveti.png"
            alt="donation"
            width={270}
            height={180}
          />
          <p>{t("თავისუფალი სვეტი")}</p>
        </Link>
      </section>
      <Footer />
    </>
  )
}

export default page
