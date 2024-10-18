"use client";

import React, { Suspense, useEffect, useState } from "react";
import DonationForm from "../components/DonationForm";
import DonationResult from "../components/DonationResult"; // Import the new component
import Image from "next/image";
import Footer from "../components/Footer";

const Page = () => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orderId = new URLSearchParams(window.location.search).get("orderId");
      if (orderId) {
        setShowResult(true);
      }
    }
  }, []);

  if (showResult) {
    return (
      <>
        <section className="w-10/12 mx-auto lg:flex hidden gap-[20px] mt-[70px]">
          <div className="sticky top-32 pt-[20px] self-start">
            <Suspense fallback={<div>Loading donation result...</div>}>
              <DonationResult />
            </Suspense>
          </div>
          <div className="W-7/12 flex flex-col gap-[60px]">
            {/* You can keep or modify the rest of your content as needed */}
            <div>
              <h1 className="font-tall-mtavruli text-6xl pl-5 font-normal text-blue-dark leading-normal mt-18 ">
                <span className="text-[#AD88C6]">"მაუწყებელს"</span>
                თქვენი მხარდაჭერა სჭირდება!
              </h1>
            </div>
            {/* Rest of your content */}
          </div>
        </section>
        {/* Mobile layout */}
        <section className="block lg:hidden">
          <div>
            <Suspense fallback={<div>Loading donation result...</div>}>
              <DonationResult />
            </Suspense>
          </div>
          {/* Rest of your mobile content */}
          <div className="W-full flex flex-col gap-[60px]">
            {/* ... */}
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="w-10/12 mx-auto lg:flex hidden gap-[20px] mt-[70px]">
        <div className="sticky top-32 pt-[20px] self-start">
          <Suspense fallback={<div>Loading donation form...</div>}>
            <DonationForm />
          </Suspense>
        </div>
        <div className="W-7/12 flex flex-col gap-[60px]">
          <div>
            <h1 className="font-tall-mtavruli text-6xl pl-5 font-normal text-blue-dark leading-normal mt-18 ">
              <span className="text-[#AD88C6]">"მაუწყებელს"</span>
              თქვენი მხარდაჭერა სჭირდება!
            </h1>
          </div>

          <div className="flex gap-[20px] w-full">
            <div className="w-6/12 flex gap-[24px] flex-col text-[#474F7A] text-[16px] font-normal ">
              <p>
                "მაუწყებელი" უარს ამბობს თავის პლატფორმებზე განათავსოს
                კომერციული რეკლამები, ვინაიდან გვჯერა, რომ მედია პოლიტიკურ
                ინტერესებთან ერთად თავისუფალი უნდა იყოს კომერციული
                ინტერესებისგანაც
              </p>
              <p>
                გვჯერა, რომ მაშინ, როდესაც მედიასივრცე ოლიგარქების,
                კორპორაციების, პარტიების დღის წესრიგით იმართება,
                "მაუწყებლის" არსებობა და განვითარება ბევრი ადამიანისთვისაა
                მნიშვნელოვანი
              </p>
            </div>
            <div className="w-6/12">
              <Image
                src="/images/tree.png"
                alt="donation"
                width={380}
                height={266}
                className="w-full"
              />
            </div>
          </div>
          {/* Rest of your content */}
          {/* ... */}
        </div>
      </section>
      {/* Mobile layout */}
      <section className="block lg:hidden">
        <div>
          <Suspense fallback={<div>Loading donation form...</div>}>
            <DonationForm />
          </Suspense>
        </div>
        <div className="W-full flex flex-col gap-[60px]">
          {/* Rest of your mobile content */}
          {/* ... */}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Page;
