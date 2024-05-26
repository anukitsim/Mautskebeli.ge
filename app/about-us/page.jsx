"use client"

import React from "react";

import Image from "next/image";



const page = () => {
  return (
    <>
      <section className="w-10/12  mx-auto lg:flex hidden gap-[20px] mt-[70px]">
      <div className="W-7/12 flex flex-col gap-[60px]">
        <div>
          <h1 className="font-tall-mtavruli text-6xl pl-5 font-normal text-blue-dark leading-normal mt-18 ">
            <span className="text-[#AD88C6]">"მაუწყებლის" </span>
           შესახებ
          </h1>
        </div>

        <div className="flex gap-[20px] w-full">
          <div className="w-6/12 flex  gap-[24px] flex-col text-[#474F7A] text-[32px] font-extrabold ">
            <p>
            “მაუწყებელი” არის ონლაინ მედია-პლატფორმა, რომელიც 2021 წლის 16 თებერვალს შეიქმნა.
            </p>
            <p>
            ჩვენი გუნდისთვის განსაკუთრებით მნიშვნელოვანია სამართლიან და თანასწორ გარემოზე ზრუნვა.


            </p>
          </div>
         <Image src='/images/about-logo.png' width={550} height={100} alt='logo'/>
        </div>
        <div className="flex flex-col gap-[24px]">
          <h1 className="text-[#474F7A] text-[32px] font-extrabold">
          რადგანაც ჩვენი სამომხმარებლო რიცხვი სოციალური ქსელებით, რომელსაც შეწირულობა და დაბა არ აკეთებს პოპულარიზაციის დროის გამოყენება და კიდევ მეტი ფუნქციონალური დასტურდება, "მაუწყებელი" მიზნად ისახავს ამ ინფორმაციის უმნიშვნელოვანესი პალატფორმა დარჩენა, როგორც დღეს ასე ყოველ დღე.
          </h1>
          <p className="text-[#474F7A] text-[32px] font-extrabold ">
            გადაღება, რედაქტირება, ავტორებთან კომუნიკაცია (მათი ჰონორარი), ახალი
            ამბების მომზადება, ტრანსპორტირება, ტექნიკური განახლება და ეს
            ყოველივე საჭიროა არა ერთხელ ან ორჯერ, არამედ მუდმივად
          </p>
          <p className="text-[#474F7A] text-[32px] font-extrabold ">
          რადგანაც ჩვენს საზოგადოებაში არსებობენ სოციალური ჯგუფები, რომელთა წუხილები და საჭიროებები არ დგას არც პოლიტიკოსების დღის წესრიგში და არც მეინსტრიმული მედიის ყურადღებას იმსახურებს, “მაუწყებლის” გუნდისთვის განსაკუთრებით მნიშვნელოვანია პლატფორმა დაუთმოს ადამიანებს, რომელთა ხმა ყველაზე ნაკლებად ისმის.
          </p>
        </div>
        <div className="flex flex-col gap-[24px]">
          <h1 className="text-[#474F7A] text-[32px] font-extrabold">
          თვალი გვადევნეთ სხვადასხვა სოციალურ ქსელში.
          </h1>
         
        </div>
      </div>
    
    </section>
   
  
    
    </>
  
  );
};

export default page;