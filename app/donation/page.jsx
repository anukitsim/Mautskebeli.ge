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
        <div className="W-7/12 flex flex-col gap-[30px] mt-4">
          <div>
            <h1 className="font-tall-mtavruli text-[#474F7A] text-6xl pl-5 font-normal text-blue-dark leading-normal mt-8 ">
              <span className="text-[#AD88C6] font-semibold">
                "მაუწყებელს"{" "}
              </span>
              თქვენი მხარდაჭერა სჭირდება!
            </h1>
          </div>

          <div className="flex gap-[20px] w-full">
            <div className="w-full  pl-4 flex gap-[24px] flex-col text-[#474F7A] text-[16px] font-normal ">
              <p>
                “მაუწყებელი” დამოუკიდებელი სახალხო მედიაა, რომელსაც დღის
                წესრიგში შემოაქვს საზოგადოებისთვის მნიშვნელოვანი პოლიტიკური და
                სოციალური საკითხები.
              </p>
              <p>
                ჩვენ ვაგრძელებთ მშრომელების დემოკრატიისა და თანასწორობისთვის
                ბრძოლის ტრადიციას - ბრძოლას იმ სიკეთეებისთვის, რომლებიც
                კაპიტალის მფლობელების ნებით არ მოგვცემია.
              </p>
              <p className="font-semibold">
                დამოუკიდებელი და უკომპრომისო საქმიანობისათვის თქვენი მხარდაჭერა
                გვჭირდება.
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
          <div className="flex pl-4 flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-bold">
              მედიის დინამიური მუშაობისთვის ბევრი რამ არის საჭირო
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              გადაღება, რედაქტირება, ახალი ამბების მომზადება, ტრანსპორტირება,
              ტექნიკური განახლება და სხვა, არა ერთჯერადი, არამედ ყოველდღიური,
              სისტემური საჭიროებებია. საერთაშორისო თუ ადგილობრივი ფონდებისგან
              მიღებული დაფინანსება ამისთვის არ კმარა. პროექტული დაფინანსების
              არასტაბილურობიდან გამომდინარე, არსებულ გამოწვევებთან გამკლავება და
              მომავლის დაგეგმვა შეუძლებელია.
            </p>
          </div>
          <div className="flex flex-col pl-4 gap-[24px]">
            <h1 className="text-[#474F7A] text-[32px] font-bold">
              გააძლიერე სახალხო მედია
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              თქვენი დახმარებით ჩვენ შევძლებთ მაუწყებლობის გაფართოებას და მეტი
              ადამიანის ინფორმირებას, რაც არსებულ პოლიტიკურ გარემოში გადამწყვეტი
              მნიშვნელობისაა.
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              “მაუწყებლის” ფინანსურად გაძლიერება შეგიძლიათ, როგორც ერთდჯერადად,
              ასევე ყოველთვიურად. ჩვენთვის განსაკუთრებით მნიშვნელოვანია
              ყოველთვიური მხარდაჭერის პრაქტიკა, რაც მოგვცემს განვითარების
              საშუალებას.
            </p>
          </div>
        </div>
      </section>
      <section className="block lg:hidden">
        <div>
          <Suspense fallback={<div>Loading donation form...</div>}>
            <div className="mt-2">
              <DonationForm />
            </div>
          </Suspense>
        </div>
        <div className="W-full flex flex-col gap-[20px]">
          <div className="flex pr-1 pl-4 text-balance flex-col gap-[20px] w-full">
            <div className=" flex gap-[24px] text-balance flex-col mt-5 text-[#474F7A] text-[16px] font-normal ">
              <div>
                <h1 className="font-tall-mtavruli text-[#474F7A] text-xl  font-normal text-blue-dark leading-normal mt-8 ">
                  <span className="text-[#AD88C6] font-semibold">
                    "მაუწყებელს"{" "}
                  </span>
                  თქვენი მხარდაჭერა სჭირდება!
                </h1>
              </div>

              <p className="w-11/12">
                “მაუწყებელი” დამოუკიდებელი სახალხო მედიაა, რომელსაც დღის
                წესრიგში შემოაქვს საზოგადოებისთვის მნიშვნელოვანი პოლიტიკური და
                სოციალური საკითხები.
              </p>
              <p className="w-11/12">
                ჩვენ ვაგრძელებთ მშრომელების დემოკრატიისა და თანასწორობისთვის
                ბრძოლის ტრადიციას - ბრძოლას იმ სიკეთეებისთვის, რომლებიც
                კაპიტალის მფლობელების ნებით არ მოგვცემია.
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
          <div className="flex  w-11/12  pl-4 flex-col gap-[24px]">
            <p className="font-semibold text-[#474F7A]">
              დამოუკიდებელი და უკომპრომისო საქმიანობისათვის თქვენი მხარდაჭერა
              გვჭირდება.
            </p>

            <h1 className="text-[#474F7A] text-[20px] font-bold">
              მედიის დინამიური მუშაობისთვის ბევრი რამ არის საჭირო
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              გადაღება, რედაქტირება, ავტორებთან კომუნიკაცია (მათი ჰონორარი),
              ახალი ამბების მომზადება, ტრანსპორტირება, ტექნიკური განახლება და ეს
              ყოველივე საჭიროა არა ერთხელ ან ორჯერ, არამედ მუდმივად
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              საერთაშორისო თუ ადგილობრივი ფონდებისგან მიღებული დაფინანსება
              ღირსეული ანაზღაურებისთვის და სრულფასოვნად მუშაობისთვის არ კმარა.
              უფრო მეტიც, ეს პროექტები ყოველთვის არ არის და თვეების განმავლობაში
              ჩვენს ჟურნალისტებსა და ოპერატორებს ჰონორარისა თუ გადაადგილებისთვის
              საჭირო თანხების გარეშე უწევთ მუშაობა
            </p>
          </div>
          <div className="flex flex-col pl-4 pr-2 gap-[24px]">
            <h1 className="text-[#474F7A]  text-[20px] font-extrabold">
              შეგიძლიათ ერთჯერადად ან ყოველთვიურად დაეხმაროთ "მაუწყებელს"
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              გადაღება, რედაქტირება, ახალი ამბების მომზადება, ტრანსპორტირება,
              ტექნიკური განახლება და სხვა, არა ერთჯერადი, არამედ ყოველდღიური,
              სისტემური საჭიროებებია. საერთაშორისო თუ ადგილობრივი ფონდებისგან
              მიღებული დაფინანსება ამისთვის არ კმარა. პროექტული დაფინანსების
              არასტაბილურობიდან გამომდინარე, არსებულ გამოწვევებთან გამკლავება და
              მომავლის დაგეგმვა შეუძლებელია.
            </p>
            <h1 className="text-[#474F7A] text-[20px] font-bold">
              გააძლიერე სახალხო მედია
            </h1>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              თქვენი დახმარებით ჩვენ შევძლებთ მაუწყებლობის გაფართოებას და მეტი
              ადამიანის ინფორმირებას, რაც არსებულ პოლიტიკურ გარემოში გადამწყვეტი
              მნიშვნელობისაა.
            </p>
            <p className="text-[#474F7A] text-[16px] font-normal ">
              “მაუწყებლის” ფინანსურად გაძლიერება შეგიძლიათ, როგორც ერთდჯერადად,
              ასევე ყოველთვიურად. ჩვენთვის განსაკუთრებით მნიშვნელოვანია
              ყოველთვიური მხარდაჭერის პრაქტიკა, რაც მოგვცემს განვითარების
              საშუალებას.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default page;
