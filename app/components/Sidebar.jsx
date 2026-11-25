"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  const { t, localize } = useLanguage();
  return (
    <aside
      className="lg:flex lg:flex-col hidden items-start justify-center lg:w-3/12 py-8 px-6 rounded-[16px] border border-lilac-20 bg-lilac-20/20 shadow-md md:w-64 flex-shrink-0 self-stretch min-h-0"
      style={{
        boxShadow: '4px 4px 12px rgba(93, 78, 116, 0.14)',
        border: '1px solid #E0DBE8',
        background: 'rgba(224, 219, 232, 0.20)',
        animation: 'slideUp 0.6s ease-out forwards',
        animationDelay: '100ms',
        opacity: 0
      }}
    >
      <div className="flex flex-col gap-7 w-full">
      <Link href={localize("/shroma")} className="flex flex-row gap-3">
        <Image src="/images/shroma.svg" alt="shroma" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
        <span className="text-[#222] text-[15px]">{t("შრომა")}</span>
      </Link>
      <Link href={localize("/mecniereba")} className="flex flex-row gap-3">
        <Image
          src="/images/mecniereba.svg"
          alt="mecniereba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("მეცნიერება")}</span>
      </Link>
      <Link href={localize("/ekonomika")} className="flex flex-row gap-3">
        <Image
          src="/images/ekonomika.svg"
          alt="ekonomika"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("ეკონომიკა")}</span>
      </Link>
      <Link href={localize("/medicina")} className="flex flex-row gap-3">
        <Image
          src="/images/medicina.svg"
          alt="medicina"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("მედიცინა")}</span>
      </Link>
      <Link href={localize("/xelovneba")} className="flex flex-row gap-3">
        <Image
          src="/images/xelovneba.svg"
          alt="xelovneba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("ხელოვნება")}</span>
      </Link>
      <Link href={localize("/kalaki")} className="flex flex-row gap-3">
        <Image
          src="/images/qalaqi.svg"
          alt="qalaqi"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("ქალაქი")}</span>
      </Link>
      <Link href={localize("/resursebi")} className="flex flex-row gap-3">
        <Image
          src="/images/resursebi.svg"
          alt="msoplio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("რესურსები")}</span>
      </Link>
      <Link href={localize("/msoflio")} className="flex flex-row gap-3">
        <Image
          src="/images/msoflio.svg"
          alt="msoflio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("მსოფლიო")}</span>
      </Link>
      <Link href={localize("/saxli")} className="flex flex-row gap-3">
        <Image
          src="/images/saxli.svg"
          alt="`saxli`-yvelas"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">{t("სახლი ყველას")}</span>
      </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
