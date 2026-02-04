'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const DonationBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [lineInView, setLineInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLineInView(true);
      },
      { threshold: 0.25, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transition = 'transition-all duration-700 ease-out';
  const base = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#474F7A] via-[#5D6590] to-[#8C74B2] flex items-center"
      style={{ aspectRatio: '1920 / 475' }}
    >
      {/* Subtle dotted pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Soft gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#AD88C6]/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#FECE27]/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Left-aligned layout: content left, CTA right on desktop */}
      <div className="relative z-10 w-11/12 md:w-10/12 max-w-6xl mx-auto py-14 lg:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-14">
        {/* Left block: icon + headline + line + second line — all left-aligned */}
        <div className="flex flex-col items-start text-left">
          <div
            className={`flex flex-col sm:flex-row sm:items-start gap-5 lg:gap-6 ${transition} ${base}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="donation-icon-pulse flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <Image
                src="/images/donation.svg"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 lg:w-12 lg:h-12 drop-shadow-md"
              />
            </div>
            <div className="flex flex-col items-start space-y-3 lg:space-y-4">
              <h2
                className={`font-alk-tall-mtavruli text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-wide leading-snug ${transition} ${base}`}
                style={{ transitionDelay: '200ms' }}
              >
                გააძლიერე მაუწყებელი
              </h2>
              {/* Yellow underline - longer (220px), left to right */}
              <div
                className={`h-1 bg-[#FECE27] rounded-full ${transition} ${base}`}
                style={{
                  width: lineInView ? '220px' : '0px',
                  transition: 'opacity 0.7s ease-out 0.35s, transform 0.7s ease-out 0.35s, width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
                }}
              />
              <p
                className={`font-alk-tall-mtavruli text-xl sm:text-2xl lg:text-3xl font-bold text-white/95 tracking-wide leading-snug ${transition} ${base}`}
                style={{ transitionDelay: '450ms' }}
              >
                გააძლიერე წინააღმდეგობა!
              </p>
            </div>
          </div>
        </div>

        {/* Right block: CTA - aligned to end on desktop */}
        <div className={`flex-shrink-0 lg:self-center ${transition} ${base}`} style={{ transitionDelay: '600ms' }}>
          <Link
            href="/donation"
            className="group inline-flex items-center gap-3 px-8 py-4 lg:px-10 lg:py-4
                       bg-[#FECE27] text-[#474F7A] rounded-full
                       text-base lg:text-lg font-bold
                       shadow-xl shadow-[#FECE27]/30
                       transition-all duration-500 ease-out
                       hover:shadow-2xl hover:shadow-[#FECE27]/40 hover:scale-[1.02]
                       active:scale-[0.99]"
          >
            <Image
              src="/images/donation.svg"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span>გააძლიერე მაუწყებელი</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DonationBanner;
