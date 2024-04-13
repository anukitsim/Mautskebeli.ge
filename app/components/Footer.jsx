"use client"

import Image from "next/image";

const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

const Footer = () => {
  return (
    <footer className="w-9/12 h-[300px] mb-[35px] mx-auto mt-[69px] flex gap-[55px]">
      <div className="h-full w-1/2 flex flex-col gap-[18px]">
        <h1 className="text-[#AD88C6] text-[16px] font-bold">კონტაქტი</h1>
      
        <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/mail.png" alt="mail" width={20} height={20} />
            <span> platformforsj@gmail.com</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/phone.png" alt="mail" width={20} height={20} />
            <span> +995 574 83 10 85</span>
          </div>
          <div className="flex gap-[10px] ">
            <Image src="/images/loacation.png" alt="mail" width={20} height={20} />
            <span className="text-[16px] whitespace-nowrap"> ბათუმი, კოსტავას 30</span>
          </div>
      <Image src='/images/logo.png' alt="logo" width={116} height={32} className='mt-[32px]'/>
      </div>
      <div className="h-full w-1/3 flex flex-col gap-[18px]">
      <h1 className="text-[#AD88C6] text-[16px] font-bold">ნავიგაცია</h1>
       <p>ჩვენს შესახებ</p>
       <p>დონაცია</p>
       <p>ვიდეოები</p>
       <p>სტატიები</p>
       <p>სპორტი</p>
       <p>ამბები</p>
      </div>
      <div className="h-full w-1/3 flex flex-col gap-[16px]">
        <h1 className="text-[#AD88C6] text-[16px] font-bold">კონტაქტი</h1>
      
        <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/facebook.png" alt="mail" width={20} height={20} />
            <span>Facebook</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/footer-youtube.png" alt="mail" width={20} height={20} />
            <span>YouTube</span>
          </div>
          <div className="flex gap-[10px] ">
            <Image src="/images/instagram.png" alt="mail" width={20} height={20} />
            <span className="text-[16px] whitespace-nowrap">Instagram</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/tiktok.png" alt="mail" width={20} height={20} />
            <span>TikTok</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/twitter.png" alt="mail" width={20} height={20} />
            <span>X Twitter</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/telegram.png" alt="mail" width={20} height={20} />
            <span>Telegram</span>
          </div>
     
      </div>
      <div className="h-full w-1/2 flex flex-col justify-start">
        <h1 className="text-[#AD88C6] text-[16px] font-bold">გამოიწერე სიახლეები</h1>
        
        {/* Subscription form */}
        <form action="" className="flex flex-col gap-[10px] mt-2">
          <input 
            className="w-full h-[44px] pl-[18px] pr-[18px] pt-[8px] pb-[8px] border border-[#CBCBCB] rounded-[4px] text-[16px]"
            type="email"
            placeholder="ელ. ფოსტა"
            style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
          />
          <input 
            className="w-full h-[44px] pl-[18px] pr-[18px] pt-[8px] pb-[8px] border border-[#CBCBCB] rounded-[4px] text-[16px]"
            type="text"
            placeholder="სახელი"
            style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
          />
          <button 
            type="submit"
            className="h-[44px] mt-4 bg-[#AD88C6] rounded-[4px] text-white text-[16px] flex items-center justify-center gap-[10px] px-[18px]"
            style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
          >
            გამოიწერე
          </button>
        </form>
        
        {/* Disclaimer text */}
        <p className="text-[#6E6893] text-[14px] mt-4">
          სიახლეების მიმღებთა სიიდან ამოწერა ყოველთვის შეგიძლიათ
        </p>

        {/* Scroll to top button */}
        <button 
          onClick={scrollToTop}
          className="mt-[35px] self-end justify-self-end p-2 text-[#474F7A] text-[16px] cursor-pointer flex items-center justify-center"
          aria-label="Scroll to top"
        >
          საწყისზე დაბრუნება
          <div className="flex justify-center items-center ml-2">
            {/* Adjust width and height as per your image's aspect ratio */}
            <Image src="/images/top.png" alt="Scroll to top" width={20} height={20} />
          </div>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
