'use client';

import Link from 'next/link';
import Image from 'next/image';

const DonationBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#474F7A] via-[#5A6499] to-[#474F7A]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#AD88C6]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FECE27]/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 px-6 py-10 lg:px-12 lg:py-14">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-white text-2xl lg:text-3xl font-bold mb-4 leading-tight">
            გააძლიერე წინააღმდეგობა!
          </h2>
          
          {/* Description */}
          <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            ივანიშვილის რეჟიმის მიზანია, საქართველოში გაქრეს მედია, რომელიც ხალხთან ერთად იბრძვის. 
            შენი მხარდაჭერა გვეხმარება გავაგრძელოთ ბრძოლა.
          </p>

          {/* CTA Button */}
          <Link
            href="/donation"
            className="inline-flex items-center gap-3 
                       bg-[#FECE27] text-[#474F7A] 
                       px-8 py-4 rounded-full
                       text-sm lg:text-base font-bold
                       shadow-lg shadow-[#FECE27]/30
                       transform transition-all duration-300
                       hover:scale-105 hover:shadow-xl hover:shadow-[#FECE27]/40
                       active:scale-95"
          >
            <Image
              src="/images/donation.svg"
              alt=""
              width={24}
              height={24}
              className="w-5 h-5 lg:w-6 lg:h-6"
            />
            <span>გააძლიერე მაუწყებელი</span>
            <svg 
              className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Trust indicator */}
          <p className="text-white/50 text-xs mt-6">
            მცირე, მაგრამ მუდმივი დონაცია დიდ განსხვავებას ქმნის
          </p>
        </div>
      </div>
    </section>
  );
};

export default DonationBanner;
