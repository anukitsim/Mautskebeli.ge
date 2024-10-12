"use client";

import React, { Suspense } from "react";
import DonationForm from "../components/DonationForm";
import Image from "next/image";
import Footer from "../components/Footer";

const page = () => {
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
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-extrabold">
              მედიაპლატფორმის დინამიური მუშაობისთვის ბევრი რამ არის საჭირო:
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              გადაღება, რედაქტირება, ავტორებთან კომუნიკაცია (მათი ჰონორარი),
              ახალი ამბების მომზადება, ტრანსპორტირება, ტექნიკური განახლება და
              ეს ყოველივე საჭიროა არა ერთხელ ან ორჯერ, არამედ მუდმივად
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              საერთაშორისო თუ ადგილობრივი ფონდებისგან მიღებული დაფინანსება
              ღირსეული ანაზღაურებისთვის და სრულფასოვნად მუშაობისთვის არ კმარა.
              უფრო მეტიც, ეს პროექტები ყოველთვის არ არის და თვეების განმავლობაში
              ჩვენს ჟურნალისტებსა და ოპერატორებს ჰონორარისა თუ გადაადგილებისთვის
              საჭირო თანხების გარეშე უწევთ მუშაობა
            </p>
          </div>
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-extrabოლd">
              შეგიძლიათ ერთჯერადად ან ყოველთვიურად დაეხმაროთ "მაუწყებელს"
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              იმისთვის, რომ უკეთ შევძლოთ მომავლის დაგეგმვა, სასურველია თუ
              თქვენი დახმარების ფორმა ყოველთვიური იქნება. მინიმალური
              მხარდაჭერაც კი ჩვენთვის უმნიშვნელოვანესია
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              Რესურსების გაზრდის შემთხვევაში, ჩვენ შევძლებთ უფრო მეტი და
              საინტერესო რეპორტაჟისა და პუბლიკაციის მომზადებას, მეტი ავტორის
              მოზიდვას, დოკუმენტური ფილმების გადაღებასა და ა.შ. შესაძლოა
              ტელევიზიად ფორმირების დროც მოახლოვდეს
            </p>
          </div>
        </div>
      </section>
      <section className="block lg:hidden">
        <div>
          <Suspense fallback={<div>Loading donation form...</div>}>
            <DonationForm />
          </Suspense>
        </div>
        <div className="W-full flex flex-col gap-[60px]">
          <div className="flex flex-col gap-[20px] w-full">
            <div className=" flex gap-[24px] flex-col mt-5 text-[#474F7A] text-[16px] font-normal ">
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
            <div className="">
              <Image
                src="/images/tree.png"
                alt="donation"
                width={380}
                height={266}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-extrabold">
              მედიაპლატფორმის დინამიური მუშაობისთვის ბევრი რამ არის საჭირო:
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              გადაღება, რედაქტირება, ავტორებთან კომუნიკაცია (მათი ჰონორარი),
              ახალი ამბების მომზადება, ტრანსპორტირება, ტექნიკური განახლება და
              ეს ყოველივე საჭიროა არა ერთხელ ან ორჯერ, არამედ მუდმივად
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              საერთაშორისო თუ ადგილობრივი ფონდებისგან მიღებული დაფინანსება
              ღირსეული ანაზღაურებისთვის და სრულფასოვნად მუშაობისთვის არ კმარა.
              უფრო მეტიც, ეს პროექტები ყოველთვის არ არის და თვეების განმავლობაში
              ჩვენს ჟურნალისტებსა და ოპერატორებს ჰონორარისა თუ გადაადგილებისთვის
              საჭირო თანხების გარეშე უწევთ მუშაობა
            </p>
          </div>
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-extrabold">
              შეგიძლიათ ერთჯერადად ან ყოველთვიურად დაეხმაროთ "მაუწყებელს"
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              იმისთვის, რომ უკეთ შევძლოთ მომავლის დაგეგმვა, სასურველია თუ
              თქვენი დახმარების ფორმა ყოველთვიური იქნება. მინიმალური
              მხარდაჭერაც კი ჩვენთვის უმნიშვნელოვანესია
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              Რესურსების გაზრდის შემთხვევაში, ჩვენ შევძლებთ უფრო მეტი და
              საინტერესო რეპორტაჟისა და პუბლიკაციის მომზადებას, მეტი ავტორის
              მოზიდვას, დოკუმენტური ფილმების გადაღებასა და ა.შ. შესაძლოა
              ტელევიზიად ფორმირების დროც მოახლოვდეს
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default page;
