"use client"

import React from "react";
import Image from "next/image";

const Page = () => {
  return (
    <>
      <section className="w-10/12 mx-auto lg:flex lg:gap-[20px] mt-[70px]">
        <div className="w-full flex flex-col gap-[60px]">
          <div>
            <h1 className="font-alk-tall-mtavruli text-6xl text-[#474F7A] font-normal leading-normal mt-18">
              <span className="text-[#AD88C6]">"მაუწყებლის" </span>
              შესახებ
            </h1>
          </div>

          <div className="flex gap-[20px] w-full">
            <div className="w-full flex gap-[24px] flex-col text-[#474F7A] text-xl">
              <p>
                “მაუწყებელი” არის ონლაინ მედია-პლატფორმა, რომელიც 2021 წლის 16 თებერვალს შეიქმნა.
              </p>
              <p>
                ჩვენი გუნდისთვის განსაკუთრებით მნიშვნელოვანია სამართლიან და თანასწორ გარემოზე ზრუნვა.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[24px] lg:text-justify">
            <h1 className="text-[#474F7A] text-xl">
              რადგანაც ჩვენი სამომხმარებლო რიცხვი სოციალური ქსელებით, რომელსაც შეწირულობა და დაბა არ აკეთებს პოპულარიზაციის დროის გამოყენება და კიდევ მეტი ფუნქციონალური დასტურდება, "მაუწყებელი" მიზნად ისახავს ამ ინფორმაციის უმნიშვნელოვანესი პალატფორმა დარჩენა, როგორც დღეს ასე ყოველ დღე.
            </h1>
            <p className="text-[#474F7A] text-xl">
              გადაღება, რედაქტირება, ავტორებთან კომუნიკაცია (მათი ჰონორარი), ახალი ამბების მომზადება, ტრანსპორტირება, ტექნიკური განახლება და ეს ყოველივე საჭიროა არა ერთხელ ან ორჯერ, არამედ მუდმივად
            </p>
            <p className="text-[#474F7A] text-xl">
              რადგანაც ჩვენს საზოგადოებაში არსებობენ სოციალური ჯგუფები, რომელთა წუხილები და საჭიროებები არ დგას არც პოლიტიკოსების დღის წესრიგში და არც მეინსტრიმული მედიის ყურადღებას იმსახურებს, “მაუწყებლის” გუნდისთვის განსაკუთრებით მნიშვნელოვანია პლატფორმა დაუთმოს ადამიანებს, რომელთა ხმა ყველაზე ნაკლებად ისმის.
            </p>
          </div>

          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[#474F7A] text-xl">
              თვალი გვადევნეთ სხვადასხვა სოციალურ ქსელში.
            </h1>
          </div>

          <h1 className="text-6xl text-[#AD88C6] font-alk-tall-mtavruli">მხარდამჭერები</h1>
          <div className="w-full flex flex-wrap gap-10 lg:gap-0 items-center pb-20">
            <div className="flex-1 min-w-[200px] h-[200px] flex lg:justify-start justify-center">
              <Image
                src='/images/mxardamcheri1.png'
                alt='mxardamcheri1'
                width={200}
                height={200}
                objectFit='contain'
              />
            </div>
            <div className="flex-1 min-w-[200px] h-[70px] flex justify-center items-center">
              <Image
                src='/images/mxardamcheri2.png'
                alt='mxardamcheri2'
                width={300}
                height={70}
                objectFit='contain'
              />
            </div>
            <div className="flex-1 min-w-[200px] h-[200px] flex justify-center">
              <Image
                src='/images/mxardamcheri3.jpeg'
                alt='mxardamcheri3'
                width={200}
                height={200}
                objectFit='contain'
              />
            </div>
            <div className="flex-1 min-w-[200px] h-[200px] flex justify-center">
              <Image
                src='/images/mxardamcheri4.jpeg'
                alt='mxardamcheri4'
                width={200}
                height={200}
                objectFit='contain'
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
