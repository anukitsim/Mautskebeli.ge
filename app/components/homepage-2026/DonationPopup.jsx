"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Real copy, real behavior, ported from the live app/components/DonationPopup.jsx —
// only the visual treatment changes (old #AD88C6/#FECE27 -> Disciplined palette).
// Note this popup has its OWN distinct real CTA text ("გახდი ჩვენი შემომწირველი"),
// different from DonationModule's CTA ("გააძლიერე მაუწყებელი") — that's not an
// inconsistency to fix, both are real, separately-approved copy from production.
const STORAGE_KEY = "donationPopupShown";

const copy = {
  ka: {
    heading: "გააძლიერე მაუწყებელი, გააძლიერე წინააღმდეგობა!",
    body: "„მაუწყებელი“ არ ეკუთვნის ბიზნესჯგუფებს თუ პოლიტიკურ ელიტებს — ის სახალხო მედიაა. ამიტომ, ჩვენი არსებობისთვის სასიცოცხლოდ მნიშვნელოვანია თქვენი მხარდაჭერა. შემოგვიერთდით, თუნდაც მცირე, მაგრამ ყოველთვიური დონაციით.",
    cta: "გახდი ჩვენი შემომწირველი",
    langLabel: "EN",
    aria: "Switch to English",
  },
  en: {
    heading: "Support us, Strengthen the resistance!",
    body: "\"Mautskebeli\" doesn't belong to business groups or political elites — it's media for the people. That's why your support is vital to our existence. Join us with a monthly donation, however small.",
    cta: "Support Us",
    langLabel: "KA",
    aria: "Switch to Georgian",
  },
};

export default function DonationPopup() {
  const [showClose, setShowClose] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState("ka");
  const panelRef = useRef(null);
  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    const t = setTimeout(() => setShowClose(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const click = (e) => panelRef.current && !panelRef.current.contains(e.target) && hide();
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
      <div aria-hidden="true" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={hide} />

      <div
        ref={panelRef}
        className="notranslate relative w-full animate-mau-popup-slide border-t border-mau-violet-deep px-6 py-6 sm:px-10 sm:py-7"
        translate="no"
        style={{ background: "linear-gradient(135deg, #3D2145 0%, #1A1219 85%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-mau-violet" aria-hidden="true" />

        <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-5">
          <button
            onClick={() => setLang((p) => (p === "ka" ? "en" : "ka"))}
            aria-label={t.aria}
            className="border border-mau-violet px-2.5 py-1 font-firago text-[11px] font-bold text-mau-violet transition-colors hover:bg-mau-violet hover:text-mau-paper"
          >
            {t.langLabel}
          </button>
          {showClose && (
            <button onClick={hide} aria-label="დახურვა" className="text-mau-ink-soft transition-colors hover:text-mau-ink">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3l12 12M15 3 3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="mx-auto grid max-w-[1280px] gap-6 pt-6 md:grid-cols-12 md:items-center md:pt-0">
          <div className="md:col-span-9">
            <h2 className="font-firago text-lg font-black leading-snug text-white sm:text-xl md:text-2xl">
              {t.heading}
            </h2>
            <p className="mt-3 max-w-[62ch] font-firago text-sm leading-relaxed text-[#D8C4DC]">
              {t.body}
            </p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <Link
              href="/donation"
              className="inline-flex h-[42px] items-center justify-center bg-mau-acid px-6 font-firago text-sm font-bold text-[#1A0E24] transition-transform hover:scale-105"
            >
              {t.cta}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes mau-popup-slide {
          from { transform: translateY(100%); }
          to { transform: translateY(0%); }
        }
        .animate-mau-popup-slide {
          animation: mau-popup-slide 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-mau-popup-slide { animation: none; }
        }
      `}</style>
    </div>
  );
}
