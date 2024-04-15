"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenu } from '../context/MenuContext';



const Navigation = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const toggleMenu = () => {
    // Close search if opening the menu
    if (!isMenuOpen) setIsSearchOpen(false);
    setIsMenuOpen(!isMenuOpen);

    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'initial';
  };

  const toggleSearch = () => {
    // Close menu if opening search
    if (!isSearchOpen) setIsMenuOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(searchQuery); // Implement your search logic here
  };

  return (
    <nav className="bg-[#AD88C6] h-14 flex items-center sm:justify-center">
      <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative">
        {/* Hamburger Icon for Mobile */}
        <div className="sm:hidden z-50 ml-7">
          <button onClick={toggleMenu}>
            <img
              src={isMenuOpen ? "/images/cross.svg" : "/images/hamburger.svg"}
              alt={isMenuOpen ? "Close" : "Menu"}
              width="30"
              height="30"
            />
          </button>
        </div>


        {/* Desktop Menu */}
        <ul className="hidden sm:flex gap-10 items-center text-white text-xs sm:text-sm">
          <Link href="/">მთავარი</Link>
          <Link href="#">ტექსტი</Link>
          <Link href="#">პოდკასტი</Link>
          <Link href="#">სპორტი</Link>
          <Link href="#">ჩვენს შესახებ</Link>
        </ul>

        {/* Search Icon for Mobile */}
        <div className="sm:hidden z-50 ">
          <button onClick={toggleSearch} className="mr-7">
            <Image
              src="/images/search.png"
              alt="Search"
              width={25}
              height={25}
            />
          </button>
        </div>

        {/* Mobile Search Input */}
        <div
          className={`${
            isSearchOpen ? "flex" : "hidden"
          } absolute top-full right-5 mt-1 mr-4 bg-white p-2 rounded-md shadow-lg z-40`}
        >
          <input
            type="text"
            placeholder="Search..."
            className="text-black outline-none px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch} type="submit" className="p-2">
            <Image
              src="/images/search.png"
              alt="Search"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
      className={`${
        isMenuOpen ? "fixed" : "hidden"
      } top-32 left-0 h-full w-full bg-[#AD88C6] p-4 sm:hidden z-50 overflow-y-auto`}
    >
          <ul className="flex pl-4 flex-col gap-4 items-left text-white text-xs">
            <li onClick={toggleMenu}>
              <Link href="/">მთავარი</Link>
            </li>
            <li onClick={toggleMenu}>
              <Link href="/texts">ტექსტები</Link>
            </li>
            <li onClick={toggleMenu}>
              <Link href="/podcasts">პოდკასტები</Link>
            </li>
            <li onClick={toggleMenu}>
              <Link href="/sports">სპორტი</Link>
            </li>
            <li onClick={toggleMenu}>
              <Link href="/about">ჩვენ შესახებ</Link>
            </li>
            {/* Categories Dropdown Toggle */}
            <li className="w-full">
              <button onClick={toggleCategories} className="w-full text-left">
                კატეგორიები {isCategoriesOpen ? "▲" : "▼"}
              </button>
              {isCategoriesOpen && (
                <ul className="flex flex-col items-left pt-4 gap-4  text-white text-xs">
                  
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category1">
                      <Image
                        src="/images/shroma-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">შრომა</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/mecniereba-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">
                        მეცნიერება
                      </span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category3">
                      <Image
                        src="/images/ekonomika-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">ეკონომიკა</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/medicina-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">მედიცინა</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/xelovneba-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">ხელოვნება</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/kalaki-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">ქალაქი</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/resursebi-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">რესურსები</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/msoflio-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">მსოფლიო</span>
                    </Link>
                  </li>
                  <li onClick={toggleMenu}>
                    <Link className="flex flex-row gap-[12px]"  href="/category2">
                      <Image
                        src="/images/saxli-white.png"
                        alt="shroma"
                        width={20}
                        height={20}
                      />
                      <span className="text-white text-xs">
                        სახლი ყველას
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Desktop Search Form - Unchanged */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex items-center gap-2.5 bg-white rounded h-9 md:w-[340px]"
        >
          <button type="submit" className="p-2 bg-white rounded-full">
            <Image
              src="/images/search.png"
              alt="Search"
              width={20}
              height={20}
            />
          </button>
          <input
            type="text"
            placeholder=""
            className="flex-1 px-4 text-[#474F7A] rounded-full border-none outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </nav>
  );
};

export default Navigation;
