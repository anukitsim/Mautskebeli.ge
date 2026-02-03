"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Page = () => {
  return (
    <main className="min-h-screen bg-[#FBFAFC]">
      {/* Title block - bigger and bolder */}
      <div className="w-11/12 md:w-10/12 max-w-4xl mx-auto px-4 pt-12 lg:pt-16 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-1.5 h-12 bg-[#AD88C6] rounded-full flex-shrink-0" />
          <h1 className="font-alk-tall-mtavruli text-4xl lg:text-5xl xl:text-6xl text-[#474F7A] font-bold leading-tight">
            <span className="text-[#AD88C6]">„მაუწყებლის"</span> შესახებ
          </h1>
        </div>
      </div>

      {/* Content - no card, direct on background */}
      <div className="w-11/12 md:w-10/12 max-w-4xl mx-auto px-4 pb-20 lg:pb-28">
        <div className="font-noto-sans-georgian text-[#474F7A] space-y-7 lg:space-y-8 text-base lg:text-lg leading-relaxed lg:leading-[1.85]">
          <p>
            „მაუწყებელი" დამოუკიდებელი ონლაინ მედია პლატფორმაა, რომელიც შეიქმნა იმ ადამიანების, თემებისა და ბრძოლების გასაშუქებლად, რომლებიც ხშირად დომინანტური მედიის დღის წესრიგს მიღმა რჩება. ჩვენი მიზანია კრიტიკული ჟურნალისტიკისა და სოციალური თხრობის საშუალებით საზოგადოებრივ დებატებში შემოვიტანოთ სოციალური უთანასწორობის, შრომითი ექსპლუატაციის, მიგრაციის, ადამიანის უფლებების და დემოკრატიის საკითხები.
          </p>

          <p>
            „მაუწყებელი" მუშაობს პრინციპით, რომ ჟურნალისტიკა მხოლოდ ინფორმაციის მიწოდება არ არის, არამედ პასუხისმგებლობა, ზრუნვა და წინააღმდეგობის ფორმაა. ჩვენ ვაკავშირებთ ყოველდღიურობას ფართო სტრუქტურულ პროცესებთან — გლობალურ კაპიტალიზმთან, იმპერიალიზმსა და კოლონიალურ ძალაუფლების ფორმებთან, რომლებიც განსაზღვრავენ შრომის პირობებს, რესურსების განაწილებასა და ადამიანების გადაადგილებას. ჩვენ უარვყოფთ ნეიტრალურობის ილუზიას და ღიად ვიკავებთ მხარეს სოციალური სამართლიანობის სასარგებლოდ.
          </p>

          <p>
            „მაუწყებელი" ფუნქციონირებს არაიერარქიული პრინციპებით. ჩვენ არ გვაქვს მკაცრი სარედაქციო ვერტიკალი, გადაწყვეტილებები მიიღება კოლექტიურად, თანამშრომლობისა და ურთიერთპასუხისმგებლობის საფუძველზე. ეს მიდგომა წარმოადგენს როგორც სამუშაო მეთოდს, ისე პოლიტიკურ პოზიციას, რომელიც ეწინააღმდეგება ძალაუფლების კონცენტრაციასა და დახურულ ინსტიტუციურ სტრუქტურებს.
          </p>

          <p>
            პლატფორმა მუშაობს დამოუკიდებლად, კომერციული და პოლიტიკური გავლენის გარეშე. „მაუწყებელი" არ ემსახურება ელიტურ ინტერესებს, ჩვენი ერთგულება მიმართულია საზოგადოებრივი ინტერესის, შრომითი ღირსებისა და სოციალური სამართლიანობისკენ.
          </p>

          {/* Closing statement - purple, catchy, with hover */}
          <p className="pt-6 text-[#8B6AAE] font-bold text-lg lg:text-xl leading-snug
                         pl-4 border-l-4 border-[#AD88C6]">
            ჩვენ გვჯერა, რომ მედია შეიძლება იყოს სივრცე სოლიდარობისთვის, კრიტიკული აზრისთვის და კოლექტიური წინააღმდეგობისთვის.
          </p>
        </div>

        {/* CTA - match donation style */}
        <div className="mt-16 lg:mt-20 text-center">
          <Link
            href="/donation"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#FECE27] text-[#5F4AA5] rounded-full font-semibold
                       shadow-lg shadow-[#FECE27]/30 hover:shadow-xl hover:shadow-[#FECE27]/40
                       hover:-translate-y-0.5 transition-all duration-300"
          >
            <Image src="/images/donation.svg" alt="" width={20} height={20} className="w-5 h-5" />
            <span>გააძლიერე მაუწყებელი</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
