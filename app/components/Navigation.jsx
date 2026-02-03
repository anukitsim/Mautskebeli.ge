"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenu } from "../context/MenuContext";
import Search from "./Search";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "initial";
    }
  }, [isMenuOpen]);

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const navItems = [
    { label: "მთავარი", href: "/" },
    { label: "ამბები", href: "/news" },
    { label: "ტექსტი", href: "/text" },
    { label: "პოდკასტი", href: "/podcast" },
    { label: "სპორტი", href: "/sporti" },
    { label: "ჩვენ შესახებ", href: "/about-us" },
  ];

  return (
    <nav className="relative h-14 flex items-center sm:justify-center overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#AD88C6]" />

      {/* Soft organic noise texture - barely visible */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)
          `,
        }}
      />

      {/* Very subtle horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 11px
          )`,
        }}
      />

      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative z-10">
        {/* Mobile menu button */}
        <div className="sm:hidden z-50 ml-7">
          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <img
              src={isMenuOpen ? "/images/cross.svg" : "/images/hamburger.svg"}
              alt={isMenuOpen ? "Close" : "Menu"}
              width="30"
              height="30"
            />
          </button>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden sm:flex gap-1 items-center font-noto-sans-georgian text-white text-xs sm:text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-item relative px-5 py-4 text-white/90 hover:text-white font-medium transition-all duration-200 group"
            >
              {/* Hover background */}
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200 rounded-sm" />
              {/* Underline effect */}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#FECE27] group-hover:w-3/4 transition-all duration-300 rounded-full" />
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </ul>

        <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />

        {/* Mobile Menu */}
        <div
          className={`${isMenuOpen ? "fixed" : "hidden"} top-32 left-0 h-full w-full bg-[#AD88C6] p-4 sm:hidden z-50 overflow-y-auto`}
        >
          <div className="text-white text-[15px] p-[24px] flex gap-[16px] flex-col">
            <div className="pb-4 border-b border-white/20">
              <LanguageSwitcher />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="py-2 hover:translate-x-1 transition-transform duration-200"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={toggleCategories}
              className="text-white text-[15px] flex items-center gap-2 py-2"
            >
              კატეგორიები
              <svg
                className={`w-4 h-4 transition-transform transform ${isCategoriesOpen ? "rotate-180" : "rotate-0"}`}
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <ul
              className={`${isCategoriesOpen ? "block" : "hidden"} flex flex-col gap-4 pl-4`}
            >
              <Link href="/shroma" className="flex flex-row gap-3">
                <Image
                  src="/images/shroma-white.svg"
                  alt="shroma"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">შრომა</span>
              </Link>
              <Link href="/mecniereba" className="flex flex-row gap-3">
                <Image
                  src="/images/mecniereba-white.svg"
                  alt="mecniereba"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">მეცნიერება</span>
              </Link>
              <Link href="/ekonomika" className="flex flex-row gap-3">
                <Image
                  src="/images/ekonomika-white.svg"
                  alt="ekonomika"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">ეკონომიკა</span>
              </Link>
              <Link href="/medicina" className="flex flex-row gap-3">
                <Image
                  src="/images/medicina-white.svg"
                  alt="medicina"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">მედიცინა</span>
              </Link>
              <Link href="/xelovneba" className="flex flex-row gap-3">
                <Image
                  src="/images/xelovneba-white.svg"
                  alt="xelovneba"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">ხელოვნება</span>
              </Link>
              <Link href="/kalaki" className="flex flex-row gap-3">
                <Image
                  src="/images/kalaki-white.svg"
                  alt="qalaqi"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">ქალაქი</span>
              </Link>
              <Link href="/resursebi" className="flex flex-row gap-3">
                <Image
                  src="/images/resursebi-white.svg"
                  alt="resursebi"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">რესურსები</span>
              </Link>
              <Link href="/msoflio" className="flex flex-row gap-3">
                <Image
                  src="/images/msoflio-white.svg"
                  alt="msoflio"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
                />
                <span className="text-white text-[15px]">მსოფლიო</span>
              </Link>
              <Link href="/saxli" className="flex flex-row gap-3">
                <Image
                  src="/images/saxli-white.svg"
                  alt="saxli-yvelas"
                  width={0}
                  height={0}
                  style={{ width: "auto", height: "20px" }}
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
