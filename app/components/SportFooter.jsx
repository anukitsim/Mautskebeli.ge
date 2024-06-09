"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const SportFooter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      email: email,
      name: name
    };

    try {
      const response = await fetch('https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setEmail('');
      setName('');
      setMessage('სიახლეები გამოწერილია');
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
      setMessage('Failed to subscribe. Please try again later.');
    }
  };

  return (
    <>
      <footer className="lg:flex hidden w-9/12 h-[300px] mb-[35px] mx-auto mt-[69px]  gap-[55px]">
        {/* Desktop version of the footer */}
        <div className="h-full w-1/2 flex flex-col gap-[18px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">კონტაქტი</h1>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/mail.png" alt="mail" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="mailto:platformforsj@gmail.com" className="text-[16px]">platformforsj@gmail.com</a>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/phone.png" alt="phone" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="tel:+995574831085" className="text-[16px]">+995 574 83 10 85</a>
          </div>
          <div className="flex gap-[10px]">
            <Image src="/images/loacation.png" alt="location" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
            <a href="https://www.google.com/maps/search/?api=1&query=Kostava+30,+Batumi" target="_blank" className="text-[16px] whitespace-nowrap">ბათუმი, კოსტავას 30</a>
          </div>
          <Image src="/images/logo.png" alt="logo" width={116} height={32} className="mt-[32px]" />
        </div>
        <div className="h-full w-1/3 flex flex-col gap-[18px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">ნავიგაცია</h1>
          <Link href="/about-us">ჩვენს შესახებ</Link>
          
          <Link href="/all-videos">ვიდეოები</Link>
          <Link href="/text">ტექსტი</Link>
          <Link href="/sporti">სპორტი</Link>
          <Link href='/bolo-ambebi'>ამბები</Link>
        </div>
        <div className="h-full w-1/3 flex flex-col gap-[16px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">კონტაქტი</h1>
          {/* Subscription form for Desktop */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px] mt-2">
            <input
              className="w-full h-[44px] pl-[18px] pr-[18px] pt-[8px] pb-[8px] border border-[#CBCBCB] rounded-[4px] text-[16px]"
              type="email"
              placeholder="ელ. ფოსტა"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
              required
            />
            <input
              className="w-full h-[44px] pl-[18px] pr-[18px] pt-[8px] pb-[8px] border border-[#CBCBCB] rounded-[4px] text-[16px]"
              type="text"
              placeholder="სახელი"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
              required
            />
            <button
              type="submit"
              className="h-[44px] mt-4 bg-[#AD88C6] rounded-[4px] text-white text-[16px] flex items-center justify-center gap-[10px] px-[18px]"
              style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
            >
              გამოიწერე
            </button>
          </form>
          <p className="text-[#6E6893] text-[14px] mt-4">
            სიახლეების მიმღებთა სიიდან ამოწერა ყოველთვის შეგიძლიათ
          </p>
          {message && <p className="text-[#FECE27] text-[16px]">{message}</p>}
        </div>
      </footer>

      {/* Mobile screen Footer */}
      <footer className="flex lg:hidden bg-[#AD88C6] flex-col justify-center mt-[42px] gap-[32px] items-center">
        <Image src="/images/white-logo.svg" alt="logo" width={116} height={32} className="mt-[32px]" />
        <div className="flex flex-col justify-center items-center gap-[18px]">
          <h1 className="text-white text-[15px] font-bold">კონტაქტი</h1>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/mail.png" alt="mail" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="mailto:platformforsj@gmail.com" className="text-[16px]">platformforsj@gmail.com</a>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/phone.png" alt="phone" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="tel:+995574831085" className="text-[16px]">+995 574 83 10 85</a>
          </div>
          <div className="flex gap-[10px]">
            <Image src="/images/loacation.png" alt="location" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
            <a href="https://www.google.com/maps/search/?api=1&query=Kostava+30,+Batumi" target="_blank" className="text-[16px] whitespace-nowrap">ბათუმი, კოსტავას 30</a>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-[18px]">
          <h1 className="text-white text-[15px] font-bold">გამოგვიწერე</h1>
          {/* Subscription form for Mobile */}
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-[10px]">
            <input
              className="w-[90vw] h-[44px] pl-[18px] pr-[18px] border border-[#CBCBCB] rounded-[4px] text-[16px] placeholder-[#474F7A]"
              type="email"
              placeholder="ელ. ფოსტა"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                fontFamily: "Noto Sans Georgian, sans-serif",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
              required
            />
            <input
              className="w-[90vw] h-[44px] pl-[18px] pr-[18px] border border-[#CBCBCB] rounded-[4px] text-[16px] placeholder-[#474F7A]"
              type="text"
              placeholder="სახელი"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                fontFamily: "Noto Sans Georgian, sans-serif",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
              required
            />
            <button
              type="submit"
              className="h-[44px] bg-[#FECE27] rounded-[4px] text-[#474F7A] text-[16px] font-bold flex items-center justify-center"
              style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
            >
              გამოიწერე
            </button>
            {message && <p className="text-[#6E6893] text-[14px] mt-4">{message}</p>}
          </form>
        </div>
        <div className="flex flex-col justify-center items-center gap-[18px]">
          <h1 className="text-white text-[15px] font-bold">ნავიგაცია</h1>
          <div className="flex gap-[42px]">
            <div className="flex flex-col gap-[12px] text-[#474F7A] text-[15px]">
              <p>ჩვენს შესახებ</p>
              <p>დონაცია</p>
              <p>ვიდეოები</p>
            </div>
            <div className="flex flex-col gap-[12px] text-[#474F7A] text-[15px]">
              <p>სტატიები</p>
              <p>სპორტი</p>
              <p>ამბები</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SportFooter;
