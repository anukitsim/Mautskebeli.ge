"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const STORAGE_KEY = "donationPopupShown";

/* ── COPY (GE default) ───────────────────────────── */
const copy = {
  ka: {
    heading: "გააძლიერე მაუწყებელი, გააძლიერე წინააღმდეგობა!",
    body: [
      "ივანიშვილის რეჟიმის მიზანია, საქართველოში გაქრეს მედია, რომელიც ხალხთან ერთად იბრძოლებს ჩაგვრისა და ექსპლუატაციის წინააღმდეგ, დაუპირისპირდება პოლიციურ რეჟიმს და უკომპრომისოდ ამხელს მსოფლიოში გაბატონებულ იმპერიალიზმს.",
      "ამ მიზნის მისაღწევად, ის გვიზღუდავს მის კონტროლმიღმა არსებული რესურსების მოზიდვას და გვემუქრება ციხით.",
      "ცხადია, ეს გვაძლევს ორმაგ მოტივაციას, გავაგრძელოთ უკომპრომისო ბრძოლა ოლიგარქიული სისტემის წინააღმდეგ. ამისთვის გვჭირდება თქვენი ყოველთვიური, თუნდაც მცირე, მაგრამ სტაბილური შემოწირულობა.",
    ],
    cta: "გახდი ჩვენი შემომწირველი",
    langLabel: "EN",
    aria: "Switch to English",
  },
  en: {
    heading: "Support us, Strengthen the resistance!",
    body: [
      "The goal of Ivanishvili’s regime is to eliminate media in Georgia that stands with the people, fights against oppression and exploitation, challenges the police state, and relentlessly exposes global imperialism.",
      "To achieve this, they restrict our access to resources beyond their control and threaten us with imprisonment.",
      "Clearly, this gives us double the motivation to continue our uncompromising fight against the oligarchic system. For this, we need your monthly support—even small but consistent donations make a difference.",
    ],
    cta: "Support Us",
    langLabel: "KA",
    aria: "Switch to Georgian",
  },
};

export default function DonationPopup() {
  const [showClose, setShowClose] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState("ka");
  const bannerRef = useRef(null);
  const hide = useCallback(() => setVisible(false), []);

  /* show once per session */
  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    const t = setTimeout(() => setShowClose(true), 1500);
    return () => clearTimeout(t);
  }, []);

  /* click-outside & Esc to dismiss */
  useEffect(() => {
    if (!visible) return;
    const click = (e) =>
      bannerRef.current && !bannerRef.current.contains(e.target) && hide();
    const esc = (e) => e.key === "Escape" && hide();
    document.addEventListener("click", click);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", esc);
    };
  }, [visible, hide]);

  if (!visible) return null;
  const t = copy[lang];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={hide}
      />

      {/* banner */}
      <div
        ref={bannerRef}
        className="
          relative w-full translate-y-full animate-banner-slide
          min-h-[34vh] md:min-h-[28vh] xl:min-h-[24vh]
          px-6 sm:px-8 md:px-12 py-8 md:py-10
          bg-gradient-to-b from-[#8C74B2] to-[#7B62B9] text-white
          shadow-[0_-4px_20px_rgba(0,0,0,.35)]
        "
      >
        {/* crown */}
        <svg
          className="absolute top-0 left-0 w-full h-[22px] sm:h-[26px] md:h-[32px] fill-[#FECE27]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path d="M0 0h1440v38c-120 20-240 35-360 35s-240-15-360-15S480 73 360 73 120 58 0 43V0Z" />
        </svg>

        {/* controls top-right */}
        <div className="absolute top-6 right-4 flex gap-3 items-center">
          <button
            onClick={() => setLang((p) => (p === "ka" ? "en" : "ka"))}
            aria-label={t.aria}
            className="
              text-xs font-bold uppercase
              bg-[#FECE27] text-[#4D3F77] rounded-full px-3 py-1
              shadow-sm hover:bg-[#ffd94f]
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FECE27]
            "
          >
            {t.langLabel}
          </button>
          {showClose && (
            <button
              onClick={hide}
              aria-label="Close donation banner"
              className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FECE27]"
            >
              <img src="/images/donation-cross.png" alt="" width={24} height={24} />
            </button>
          )}
        </div>

        {/* layout:  md→ two columns  */}
        <div className="md:grid md:grid-cols-12 md:items-center gap-8 flex-1 overflow-y-auto">
          {/* text */}
          <div className="md:col-span-8">
            <h2 className="font-extrabold text-[#FECE27] text-xl sm:text-2xl md:text-3xl mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,.45)]">
              {t.heading}
            </h2>

            <div className="space-y-5 text-[15px] sm:text-[16px] md:text-lg leading-relaxed">
              {t.body.map((p) => (
                <p key={p.slice(0, 22)}>{p}</p>
              ))}
            </div>
          </div>

        
         
        </div>

        {/* CTA row */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/donation"
            className="
              inline-flex items-center justify-center
              h-[46px] px-8 rounded-full
              bg-[#FECE27] text-[#4D3F77] font-bold
              shadow-[0_0_10px_rgba(254,206,39,.6)]
              transition hover:shadow-[0_0_20px_rgba(254,206,39,1)]
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FECE27]
            "
          >
            {t.cta}
          </Link>
        </div>
      </div>

      {/* motion */}
      <style jsx>{`
        @keyframes banner-slide {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0%);
          }
        }
        .animate-banner-slide {
          animation: banner-slide 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)
            forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-banner-slide {
            animation: none;
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}
