'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMenu } from '../context/MenuContext';
import Search from './Search';
import { useRouter } from 'next/navigation';

const Navigation = ({ onVideoSelect }) => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    if (!isMenuOpen) setIsSearchOpen(false);
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
    }
  }, [isMenuOpen]);

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  return (
    <nav className="bg-[#AD88C6] h-14 flex items-center sm:justify-center">
      <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative">
        <div className="sm:hidden z-50 ml-7">
          <button onClick={toggleMenu}>
            <img src={isMenuOpen ? "/images/cross.svg" : "/images/hamburger.svg"} alt={isMenuOpen ? "Close" : "Menu"} width="30" height="30" />
          </button>
        </div>
        <ul className="hidden sm:flex gap-10 items-center font-noto-sans-georgian  text-white text-xs sm:text-sm">
          <Link href="/">მთავარი</Link>
          <Link href="/text">ტექსტი</Link>
          <Link href="/podcast">პოდკასტი</Link>
          <Link href="/sporti">სპორტი</Link>
          <Link href="/about-us">ჩვენს შესახებ</Link>
        </ul>
        <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
        <div className={`${isMenuOpen ? "fixed" : "hidden"} top-32 left-0 h-full w-full bg-[#AD88C6] p-4 sm:hidden z-50 overflow-y-auto`}>
          <div className='text-white text-[15px] p-[24px] flex gap-[16px] flex-col'>
            <Link href="/">მთავარი</Link>
            <Link href="/text">ტექსტი</Link>
            <Link href="/podcast">პოდკასტი</Link>
            <Link href="/sporti">სპორტი</Link>
            <Link href="/about-us">ჩვენს შესახებ</Link>
            <button onClick={toggleCategories} className="text-white text-[15px]  flex items-center gap-2">
              კატეგორიები
              <svg
                className={`w-4 h-4 transition-transform transform ${isCategoriesOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            <ul className={`${isCategoriesOpen ? "block" : "hidden"} flex flex-col gap-4 pl-4`}>
            <Link href="/shroma" className="flex flex-row gap-3">
              <Image src="/images/shroma-white.png" alt="shroma" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
              <span className="text-white text-[15px]">შრომა</span>
            </Link>
            <Link href="/mecniereba-white" className="flex flex-row gap-3">
              <Image
                src="/images/mecniereba-white.png"
                alt="mecniereba"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">მეცნიერება</span>
            </Link>
            <Link href="/ekonomika" className="flex flex-row gap-3">
              <Image
                src="/images/ekonomika-white.png"
                alt="ekonomika"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">ეკონომიკა</span>
            </Link>
            <Link href="/medicina" className="flex flex-row gap-3">
              <Image
                src="/images/medicina-white.png"
                alt="medicina"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">მედიცინა</span>
            </Link>
            <Link href="/xelovneba" className="flex flex-row gap-3">
              <Image
                src="/images/xelovneba-white.png"
                alt="xelovneba"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">ხელოვნება</span>
            </Link>
            <Link href="/kalaki" className="flex flex-row gap-3">
              <Image
                src="/images/kalaki-white.png"
                alt="qalaqi"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">ქალაქი</span>
            </Link>
            <Link href="/resursebi" className="flex flex-row gap-3">
              <Image
                src="/images/resursebi-white.png"
                alt="resursebi"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">რესურსები</span>
            </Link>
            <Link href="/msoflio" className="flex flex-row gap-3">
              <Image
                src="/images/msoflio-white.png"
                alt="msoflio"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px]">მსოფლიო</span>
            </Link>
            <Link href="/saxli-yvelas" className="flex flex-row gap-3">
              <Image
                src="/images/saxli-white.png"
                alt="saxli-yvelas"
                width={0}
                height={0}
                style={{ width: 'auto', height: '20px' }}
              />
              <span className="text-white text-[15px] ">სახლი ყველას</span>
            </Link>
          </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
