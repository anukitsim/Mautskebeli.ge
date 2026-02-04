"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const SportHeader = () => {
  return (
    <header className="relative h-16 sm:h-20 w-full flex flex-col items-start overflow-visible border-b border-white/10">
      <div className="absolute inset-0 bg-[#AD88C6]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 w-11/12 sm:w-10/12 mx-auto mt-3 sm:mt-5 flex justify-between items-center overflow-visible h-1/2">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/sport-logo.svg"
            alt="სპორტი logo"
            width={116}
            height={40}
            className="w-[90px] h-[31px] sm:w-[116px] sm:h-[40px]"
            priority
          />
        </Link>
        <div className="flex gap-2 sm:gap-4 items-center overflow-visible">
          <Link
            href="/donation"
            className="relative inline-flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-semibold
              px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full
              bg-[#FECE27] text-[#5F4AA5]
              shadow-[0_0_10px_rgba(254,206,39,.5)]
              transition-all duration-300 ease-out
              hover:shadow-[0_0_18px_rgba(254,206,39,0.8)] focus-visible:outline-none flex-shrink-0"
          >
            <Image
              src="/images/donation.svg"
              alt=""
              width={16}
              height={16}
              className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]"
            />
            <span className="hidden sm:inline">გააძლიერე მაუწყებელი</span>
          </Link>
          <LanguageSwitcher variant="header" />
        </div>
      </div>
    </header>
  );
};

export default SportHeader;
