"use client"

import Image from "next/image";
import Link from "next/link";

const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

const Footer = () => {
  return (
    <>
    <footer className="lg:flex hidden w-9/12 h-[300px] mb-[35px] mx-auto mt-[69px]  gap-[55px]">
      <div className="h-full w-1/2 flex flex-col gap-[18px]">
        <h1 className="text-[#AD88C6] text-[16px] font-bold">კონტაქტი</h1>
      
        <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/mail.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span> platformforsj@gmail.com</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/phone.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span> +995 574 83 10 85</span>
          </div>
          <div className="flex gap-[10px] ">
            <Image src="/images/loacation.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span className="text-[16px] whitespace-nowrap"> ბათუმი, კოსტავას 30</span>
          </div>
      <Image src='/images/logo.png' alt="logo" width={116} height={32}  className='mt-[32px]'/>
      </div>
      <div className="h-full w-1/3 flex flex-col gap-[18px]">
      <h1 className="text-[#AD88C6] text-[16px] font-bold">ნავიგაცია</h1>
       <Link href='#'>ჩვენს შესახებ</Link>
       <Link href='/donation'>დონაცია</Link>
       <Link href='#'>ვიდეოები</Link>
       <Link href='/text'>ტექსტი</Link>
       <Link href='/#'>სპორტი</Link>
       <p>ამბები</p>
      </div>
      <div className="h-full w-1/3 flex flex-col gap-[16px]">
        <h1 className="text-[#AD88C6] text-[16px] font-bold">კონტაქტი</h1>
      
        <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/facebook.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <Link href='https://www.facebook.com/mautskebeli.ge'>Facebook</Link>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/footer-youtube.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <Link href='https://www.youtube.com/@mautskebeli'>YouTube</Link>
          </div>
          <div className="flex gap-[10px] ">
            <Image src="/images/instagram.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <Link href='https://www.instagram.com/mautskebeli.ge/' className="text-[16px] whitespace-nowrap">Instagram</Link>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/tiktok.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <Link href='https://www.tiktok.com/@mautskebeli.ge'>TikTok</Link>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/twitter.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <Link href='https://x.com/mautskebeli?s=21'>X Twitter</Link>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/telegram.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
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
            <Image src="/images/top.png" alt="Scroll to top" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
          </div>
        </button>
      </div>
    </footer>
    {/* Mobile screen Footer */}
    <footer className="flex lg:hidden bg-[#AD88C6] flex-col justify-center mt-[42px] gap-[32px] items-center">
    <Image src='/images/white-logo.svg' alt="logo" width={116} height={32} className='mt-[32px]'/>
        <div className="flex flex-col justify-center items-center gap-[18px]">
            <h1 className="text-white text-[15px] font-bold">კონტაქტი</h1>
            <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/mail.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span className="text-[#474F7A] text-[14px]"> platformforsj@gmail.com</span>
          </div>
          <div className="flex gap-[10px] text-[16px]">
            <Image src="/images/phone.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span className="text-[#474F7A] text-[14px]"> +995 574 83 10 85</span>
          </div>
          <div className="flex gap-[10px] ">
            <Image src="/images/loacation.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span className="text-[14px] text-[#474F7A] whitespace-nowrap"> ბათუმი, კოსტავას 30</span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-[18px]">
        <h1 className="text-white text-[15px] font-bold">გამოგვიწერე</h1>
        <div className="flex gap-[16px] text-[#474F7A]">
        <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/facebook-mobile.png" alt="mail" width={20} height={20}  style={{ width: 'auto', height: '20px' }}/>
            <span>Facebook</span>
          </div>
          <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/youtube-mobile.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span>YouTube</span>
          </div>
          <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/instagram-mobile.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span className="text-[16px] whitespace-nowrap">Instagram</span>
          </div>
        </div>
        <div className="flex gap-[16px] text-[#474F7A]">
        <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/tiktok-mobile.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span>TikTok</span>
          </div>
          <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/twitter-mobile.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span>X Twitter</span>
          </div>
          <div className="flex gap-[6px] text-[16px]">
            <Image src="/images/telegram-mobile.png" alt="mail" width={0} height={0}  style={{ width: 'auto', height: '20px' }}/>
            <span>Telegram</span>
          </div>
        </div>
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
        <div className="bg-[#AD88C6] p-[15px] flex flex-col items-center justify-center">
  <h1 className="text-white text-[16px] font-bold mb-[18px]">გამოიწერე სიახლეები</h1>
  <form action="" className="flex flex-col w-full gap-[10px]">
    <input 
      className="w-[90vw] h-[44px] pl-[18px] pr-[18px] border border-[#CBCBCB] rounded-[4px] text-[16px] placeholder-[#474F7A]"
      type="email"
      placeholder="ელ. ფოსტა"
      style={{ fontFamily: "Noto Sans Georgian, sans-serif", backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    />
    <input 
      className="w-[90vw] h-[44px] pl-[18px] pr-[18px] border border-[#CBCBCB] rounded-[4px] text-[16px] placeholder-[#474F7A]"
      type="text"
      placeholder="სახელი"
      style={{ fontFamily: "Noto Sans Georgian, sans-serif", backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    />
     <p className="text-[#6E6893] text-[14px] mt-4">
          სიახლეების მიმღებთა სიიდან ამოწერა ყოველთვის შეგიძლიათ
        </p>
    <button 
      type="submit"
      className="h-[44px] bg-[#FECE27] rounded-[4px] text-[#474F7A] text-[16px] font-bold flex items-center justify-center"
      style={{ fontFamily: "Noto Sans Georgian, sans-serif" }}
    >
      გამოიწერე
    </button>
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
  </form>
</div>

    </footer>
    </>
    
  );
};

export default Footer;
