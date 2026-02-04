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
      "The goal of Ivanishvili's regime is to eliminate media in Georgia that stands with the people, fights against oppression and exploitation, challenges the police state, and relentlessly exposes global imperialism.",
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

      {/* banner - immune to Google Translate */}
      <div
        ref={bannerRef}
        className="
          notranslate
          relative w-full translate-y-full animate-banner-slide
          min-h-[22vh] md:min-h-[18vh] xl:min-h-[16vh]
          px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-5
          bg-[#AD88C6] text-white
          shadow-[0_-4px_20px_rgba(0,0,0,.25)]
        "
        translate="no"
      >
        {/* thin yellow accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-[#FECE27] opacity-95"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}
          aria-hidden="true"
        />

        {/* controls top-right */}
        <div className="absolute top-3 right-4 sm:top-3.5 flex gap-3 items-center">
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
        <div className="md:grid md:grid-cols-12 md:items-center gap-6 flex-1 overflow-y-auto pt-6 sm:pt-7 md:pt-6">
          {/* text */}
          <div className="md:col-span-8">
            <h2 className="font-extrabold text-[#FECE27] text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,.45)]">
              {t.heading}
            </h2>

            <div className="space-y-2.5 sm:space-y-3 text-[14px] sm:text-[15px] md:text-base leading-relaxed">
              {t.body.map((p) => (
                <p key={p.slice(0, 22)}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-4 sm:mt-5 flex justify-end">
          <Link
            href="/donation"
            className="
              inline-flex items-center justify-center
              h-[42px] px-7 rounded-full text-sm md:text-base
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
