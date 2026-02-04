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
      <footer className="lg:flex hidden w-9/12 h-[300px] mb-[35px] mx-auto mt-[69px]  gap-[40px]">
        {/* Desktop version of the footer */}
        <div className="h-full w-1/2 flex flex-col gap-[18px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">კონტაქტი</h1>
          <div className="flex gap-[10px] text-[16px] text-[#FFFFFF]">
            <Image src="/images/mail-white.svg" alt="mail" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="mailto:platformforsj@gmail.com" className="text-[16px] hover:text-[#FECE27] transition-colors">platformforsj@gmail.com</a>
          </div>
          <div className="flex gap-[10px] text-[#FFFFFF] text-[16px]">
            <Image src="/images/phone-white.svg" alt="phone" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="tel:+995574831085" className="text-[16px] hover:text-[#FECE27] transition-colors">+995 574 83 10 85</a>
          </div>
          <div className="flex gap-[10px] text-[#FFFFFF]">
            <Image src="/images/location-white.svg" alt="location" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
            <a href="https://www.google.com/maps/search/?api=1&query=Kostava+30,+Batumi" target="_blank" className="text-[16px] whitespace-nowrap hover:text-[#FECE27] transition-colors">ბათუმი, კოსტავას 30</a>
          </div>
          <Link href='/'>
          <Image src="/images/sport-logo.svg" alt="სპორტი logo" width={116} height={40} className="mt-[32px]" />
          </Link>
        
        </div>
        <div className="h-full w-1/3 flex flex-col gap-[18px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">ნავიგაცია</h1>
          <Link href="/about-us" className="text-[#FFFFFF] hover:text-[#FECE27] transition-colors">ჩვენ შესახებ</Link>
          <Link href="/all-videos" className="text-[#FFFFFF] hover:text-[#FECE27] transition-colors">ვიდეოები</Link>
          <Link href="/text" className="text-[#FFFFFF] hover:text-[#FECE27] transition-colors">ტექსტი</Link>
          <Link href="/sporti" className="text-[#FFFFFF] hover:text-[#FECE27] transition-colors">სპორტი</Link>
          <Link href="/news" className="text-[#FFFFFF] hover:text-[#FECE27] transition-colors">ამბები</Link>
        </div>
        <div className="h-full w-1/3 flex flex-col gap-[16px]">
        <h1 className="text-[#FECE27] text-[16px] font-bold">გამოგვიწერე</h1>
      
        <Link href='https://www.facebook.com/mautskebeli.ge' target='_blank' className="flex gap-[10px] text-[#FFFFFF] hover:text-[#FECE27] text-[16px] transition-colors">
            <Image src="/images/facebook-white.svg" alt="mail" width={20} height={20} />
            <span>Facebook</span>
          </Link>
          <Link href='https://www.youtube.com/@mautskebeli' target='_blank' className="flex gap-[10px] text-[#FFFFFF] hover:text-[#FECE27] text-[16px] transition-colors">
            <Image src="/images/youtube-white.svg" alt="mail" width={20} height={20} />
            <span>YouTube</span>
          </Link>
          <Link href='https://www.instagram.com/mautskebeli.ge/' target='_blank' className="flex gap-[10px] text-[#FFFFFF] hover:text-[#FECE27] transition-colors">
            <Image src="/images/instagram-white.svg" alt="mail" width={20} height={20} />
            <span className="text-[16px] whitespace-nowrap">Instagram</span>
          </Link>
          <Link href='https://www.tiktok.com/@mautskebeli.ge' target='_blank' className="flex gap-[10px] text-[#FFFFFF] hover:text-[#FECE27] text-[16px] transition-colors">
            <Image src="/images/tiktok-white.svg" alt="mail" width={20} height={20} />
            <span>TikTok</span>
          </Link>
          <Link href='https://x.com/mautskebeli' target='_blank' className="flex gap-[10px] text-[#FFFFFF] hover:text-[#FECE27] text-[16px] transition-colors">
            <Image src="/images/x-white.svg" alt="mail" width={20} height={20} />
            <span>X Twitter</span>
          </Link>
          <div className="flex gap-[10px] text-[#FFFFFF] text-[16px]">
            <Image src="/images/telegram-white.svg" alt="mail" width={20} height={20} />
            <span>Telegram</span>
          </div>
     
      </div>

        <div className="h-full w-1/2 flex flex-col gap-[16px]">
          <h1 className="text-[#FECE27] text-[16px] font-bold">გამოიწერე სიახლეები</h1>
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
              className="h-[44px] mt-4 bg-[#FECE27] rounded-[4px] text-[#474F7A] text-[16px] flex items-center justify-center gap-[10px] px-[18px]"
              style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
            >
              გამოიწერე
            </button>
          </form>
          <p className="text-[#6E6893] text-[14px] mt-4">
            სიახლეების მიმღებთა სიიდან ამოწერა ყოველთვის შეგიძლიათ
          </p>
          {message && <p className="text-[#AD88C6] text-[16px]">{message}</p>}
           {/* Scroll to top button */}
           <button
            onClick={scrollToTop}
            className="mt-[35px] self-end justify-self-end p-2 text-[#474F7A] text-[16px] cursor-pointer flex items-center justify-center"
            aria-label="Scroll to top"
          >
            საწყისზე დაბრუნება
            <div className="flex justify-center items-center ml-2">
              {/* Adjust width and height as per your image's aspect ratio */}
              <Image
                src="/images/top.svg"
                alt="Scroll to top"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
            </div>
          </button>
        </div>
        
      </footer>

      {/* Mobile screen Footer */}
      <footer className="flex lg:hidden bg-[#AD88C6] flex-col justify-center mt-[42px] gap-[32px] items-center">
        <Image src="/images/sport-logo.svg" alt="სპორტი logo" width={116} height={40} className="mt-[32px]" />
        <div className="flex flex-col justify-center items-center gap-[18px]">
          <h1 className="text-white text-[15px] font-bold">კონტაქტი</h1>
          <div className="flex gap-[10px]  text-[#474F7A] text-[15px]">
            <Image src="/images/mail.svg" alt="mail" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="mailto:platformforsj@gmail.com" className="text-[16px]">platformforsj@gmail.com</a>
          </div>
          <div className="flex gap-[10px]  text-[#474F7A] text-[15px]">
            <Image src="/images/phone.svg" alt="phone" width={0} height={0} style={{ width: "auto", height: "20px" }} />
            <a href="tel:+995574831085" className="text-[16px]">+995 574 83 10 85</a>
          </div>
          <div className="flex gap-[10px]  text-[#474F7A] text-[15px]">
            <Image src="/images/location.svg" alt="location" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
            <a href="https://www.google.com/maps/search/?api=1&query=Kostava+30,+Batumi" target="_blank" className="text-[16px] whitespace-nowrap">ბათუმი, კოსტავას 30</a>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-[18px]">
          <h1 className="text-white text-[15px] font-bold">გამოგვიწერე</h1>
          <div className="flex gap-[16px] text-[#474F7A]">
            <Link  href='https://www.facebook.com/mautskebeli.ge' target='_blank' className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/facebook-mobile.svg"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span>Facebook</span>
            </Link>
            <Link href='https://www.youtube.com/@mautskebeli' target='_blank' className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/youtube-mobile.svg"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span>YouTube</span>
            </Link>
            <Link href='https://www.instagram.com/mautskebeli.ge/' target='_blank' className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/instagram-mobile.svg"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span className="text-[16px] whitespace-nowrap">Instagram</span>
            </Link>
          </div>
          <div className="flex gap-[16px] text-[#474F7A]">
            <Link href='https://www.tiktok.com/@mautskebeli.ge' target='_blank' className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/tiktok-mobile.svg"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span>TikTok</span>
            </Link>
            <Link href='https://x.com/mautskebeli' target='_blank' className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/twitter-mobile.svg"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span>X Twitter</span>
            </Link>
            <div className="flex gap-[6px] text-[16px]">
              <Image
                src="/images/telegram-mobile.png"
                alt="mail"
                width={0}
                height={0}
                style={{ width: "auto", height: "20px" }}
              />
              <span>Telegram</span>
            </div>
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
            <Link href="/about-us">ჩვენ შესახებ</Link>
          
          <Link href="/all-videos">ვიდეოები</Link>
          <Link href="/text">ტექსტი</Link>
            </div>
            <div className="flex flex-col gap-[12px] text-[#474F7A] text-[15px]">
           
          <Link href="/sporti">სპორტი</Link>
          <Link href='/bolo-ambebi'>ამბები</Link>
            </div>
            
          </div>
          <button
              onClick={scrollToTop}
              className="mt-[35px] self-end justify-self-end p-2 text-[#474F7A] text-[16px] cursor-pointer flex items-center justify-center"
              aria-label="Scroll to top"
            >
              საწყისზე დაბრუნება
              <div className="flex justify-center items-center ml-2">
                {/* Adjust width and height as per your image's aspect ratio */}
                <Image
                  src="/images/top.svg"
                  alt="Scroll to top"
                  width={20}
                  height={20}
                />
              </div>
            </button>
        </div>
      </footer>
    </>
  );
};

export default SportFooter;