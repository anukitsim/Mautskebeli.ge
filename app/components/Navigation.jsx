"use client"
import { useState } from 'react';
import Link from "next/link";
import Image from 'next/image';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleMenu = () => {
        // Close search if opening the menu
        if (!isMenuOpen) setIsSearchOpen(false);
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleSearch = () => {
        // Close menu if opening search
        if (!isSearchOpen) setIsMenuOpen(false);
        setIsSearchOpen(!isSearchOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(searchQuery); // Implement your search logic here
    };

    return (
        <nav className='bg-[#AD88C6] h-14 flex items-center sm:justify-center'>
            <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative">
                {/* Hamburger Icon for Mobile */}
                <div className="sm:hidden z-50 ml-7">
                    <button onClick={toggleMenu}>
                        {isMenuOpen ? (
                            <img src="/images/cross.svg" alt="Close" width="30" height="30"/>
                        ) : (
                            <img src="/images/hamburger.svg" alt="Menu" width="30" height="30" />
                        )}
                    </button>
                </div>

                {/* Desktop Menu */}
                <ul className='hidden sm:flex gap-10 items-center text-white text-xs sm:text-sm'>
                    <Link href='#'>მთავარი</Link>
                    <Link href='#'>ტექსტი</Link>
                    <Link href='#'>პოდკასტი</Link>
                    <Link href='#'>სპორტი</Link>
                    <Link href='#'>ჩვენს შესახებ</Link>
                </ul>

                {/* Search Icon for Mobile */}
                <div className="sm:hidden z-50 ">
                    <button onClick={toggleSearch} className="mr-7">
                        <Image src="/images/search.png" alt="Search" width={25} height={25} />
                    </button>
                </div>

                {/* Mobile Search Input */}
                <div className={`${isSearchOpen ? 'flex' : 'hidden'} absolute top-full right-5 mt-1 mr-4 bg-white p-2 rounded-md shadow-lg z-40`}>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="text-black outline-none px-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearch} type="submit" className="p-2">
                        <Image src="/images/search.png" alt="Search" width={20} height={20} />
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 w-full bg-[#AD88C6] p-4 sm:hidden z-40`}>
                    <ul className='flex flex-col gap-4  items-center text-white text-xs'>
                        <li onClick={() => setIsMenuOpen(false)}>
                            <Link href='#'>მთავარი</Link>
                        </li>
                        <li onClick={() => setIsMenuOpen(false)}>
                            <Link href='#'>ტექსტი</Link>
                        </li>
                        <li onClick={() => setIsMenuOpen(false)}>
                            <Link href='#'>პოდკასტი</Link>
                        </li>
                        <li onClick={() => setIsMenuOpen(false)}>
                            <Link href='#'>სპორტი</Link>
                        </li>
                        <li onClick={() => setIsMenuOpen(false)}>
                            <Link href='#'>ჩვენს შესახებ</Link>
                        </li>
                    </ul>
                </div>

                {/* Desktop Search Form - Unchanged */}
                <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2.5 bg-white rounded h-9 md:w-[340px]">
                <button type="submit" className="p-2 bg-white rounded-full">
                        <Image src="/images/search.png" alt="Search" width={20} height={20} />
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