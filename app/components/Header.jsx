"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  return (
    <header className="h-20 w-full flex bg-[#FBFAFC] flex-col items-start">
      {/* top line */}
      <div className="w-10/12 h-1/2 mx-auto mt-5 flex justify-between items-center">
        {/* logo */}
        <Link href="/">
          <Image
            src="/images/IMG_0311.svg"
            alt="logo"
            width={116}
            height={32}
            priority
          />
        </Link>

        {/* right-hand actions */}
        <div className="flex gap-4 items-center">
          {/* ░░ HIGHLIGHTED DONATION ░░ */}
          <Link
            href="/donation"
            className="
              relative inline-flex items-center gap-2.5 text-xs font-semibold
              px-4 py-2 rounded-full
              bg-[#FECE27] text-[#5F4AA5]
              shadow-[0_0_10px_rgba(254,206,39,.6)]
              transition-all duration-300 ease-out
              hover:shadow-[0_0_18px_rgba(254,206,39,1)] focus-visible:outline-none
            "
          >
            <Image
              src="/images/donation.svg"
              alt=""
              width={20}
              height={20}
              style={{ width: "20px", height: "20px" }}
            />
            <span className="hidden sm:inline">გააძლიერე მაუწყებელი</span>

            {/* brighter / wider pulse */}
            <span
              className="
                absolute inset-0 rounded-full
                animate-donate-pulse
                pointer-events-none
              "
            />
          </Link>

          {/* live link */}
          <Link
            href="/live"
            className="flex gap-2.5 text-xs justify-center items-center"
          >
            <Image
              src="/images/pirdapiri-eteri.svg"
              alt="Live"
              width={20}
              height={20}
            />
            <span className="hidden sm:inline text-[#474F7A]">
              პირდაპირი ეთერი
            </span>
          </Link>

          {/* Language Switcher - styled for header */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </div>

      {/* custom pulse keyframes */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes donate-pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(254, 206, 39, 0.8);
              transform: scale(1);
              opacity: 1;
            }
            60% {
              /* bigger spread + tiny scale-up for extra pop */
              box-shadow: 0 0 0 18px rgba(254, 206, 39, 0);
              transform: scale(1.08);
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }
          .animate-donate-pulse {
            /* slightly faster loop so it catches the eye more often */
            animation: donate-pulse 1.8s cubic-bezier(0.22, 0.61, 0.36, 1)
              infinite;
          }
          /* pause pulse on hover/focus so users aren’t distracted */
          a:hover .animate-donate-pulse,
          a:focus-visible .animate-donate-pulse {
            animation-play-state: paused;
            opacity: 0;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
