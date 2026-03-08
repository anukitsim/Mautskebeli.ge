'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const decodeHTMLEntities = (str) => {
  if (typeof window === 'undefined') return str || '';
  if (!str) return '';
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

const BADGE_STYLES = {
  news: { bg: 'bg-[#AD88C6]', shadow: 'shadow-[#AD88C6]/30' },
  video: { bg: 'bg-[#474F7A]', shadow: 'shadow-[#474F7A]/30' },
  podcast: { bg: 'bg-[#6A4C93]', shadow: 'shadow-[#6A4C93]/30' },
  article: { bg: 'bg-[#7B8FA1]', shadow: 'shadow-[#7B8FA1]/30' },
};

const BADGE_ICONS = {
  news: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
    </svg>
  ),
  video: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  podcast: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
  article: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

const CTA_LABELS = {
  news: 'წაიკითხე',
  video: 'უყურე',
  podcast: 'მოუსმინე',
  article: 'წაიკითხე',
};

const CTA_ICONS = {
  news: (
    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  video: (
    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  ),
  podcast: (
    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  article: (
    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
};

const HeroSideCardsClient = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full h-full">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-[#E8E0EE] via-[#F0ECF4] to-[#E0DBE8]"
            style={{ animation: 'shimmer 1.8s ease-in-out infinite', backgroundSize: '200% 100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {cards.slice(0, 2).map((card, index) => {
        const isVideoType = card.categoryType === 'video' || card.categoryType === 'podcast';
        const badgeStyle = BADGE_STYLES[card.categoryType] || BADGE_STYLES.news;
        const badgeIcon = BADGE_ICONS[card.categoryType] || BADGE_ICONS.news;
        const ctaLabel = CTA_LABELS[card.categoryType] || CTA_LABELS.news;
        const ctaIcon = CTA_ICONS[card.categoryType] || CTA_ICONS.news;

        return (
          <Link key={card.id} href={card.href} className="group block flex-1 min-h-0">
            <article
              className="relative h-full rounded-2xl overflow-hidden shadow-xl"
              style={{
                animation: 'slideUp 0.55s ease-out forwards',
                animationDelay: `${150 + index * 130}ms`,
                opacity: 0,
              }}
            >
              <Image
                src={card.image}
                alt={decodeHTMLEntities(card.title)}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 group-hover:from-black/85 transition-all duration-500" />

              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white ${badgeStyle.bg} shadow-lg ${badgeStyle.shadow}`}>
                  {badgeIcon}
                  {card.category}
                </span>
              </div>

              {isVideoType && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/95 shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-400">
                    <svg className="w-6 h-6 text-[#AD88C6] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 xl:p-6 z-10">
                <p className="text-white/50 text-xs font-medium tracking-wide mb-2">
                  {formatDate(card.date)}
                </p>
                <h3 className="font-alk-tall-mtavruli text-white text-[20px] xl:text-[24px] font-light leading-[1.25] line-clamp-3 group-hover:text-[#FECE27] transition-colors duration-300">
                  {decodeHTMLEntities(card.title)}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-[#FECE27] text-xs font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>{ctaLabel}</span>
                  {ctaIcon}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FECE27] to-[#FDD835] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
            </article>
          </Link>
        );
      })}
    </div>
  );
};

export default HeroSideCardsClient;
