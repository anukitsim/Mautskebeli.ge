'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <div className="sm:hidden z-50">
        {!isSearchOpen && (
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="mr-7">
            <Image src="/images/Search.svg" alt="Search" width={25} height={25} />
          </button>
        )}
      </div>

      {/* Mobile Search Input */}
      <div className={`${isSearchOpen ? 'flex' : 'hidden'} absolute top-[-5px] right-5 mt-1 mr-4 bg-white p-2 rounded-md shadow-lg z-40`}>
        <input
          type="text"
          placeholder=""
          className="text-black outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} type="submit" className="p-2">
          <Image src="/images/Search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>

      {/* Desktop Search Input */}
      <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-0 bg-white rounded h-9 md:w-[340px]">
        {/* Reduced padding to bring the search icon closer */}
        <button type="submit" className="p-1 bg-white rounded-full flex items-center justify-center"> 
          <img src="/images/Search.svg" alt="Search" width={20} height={20} />
        </button>

        {/* Adjusted padding on the input field to bring the cursor closer */}
        <input
          type="text"
          placeholder=""
          className="flex-1 pl-1 text-[#474F7A] rounded-full border-none outline-none" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    </>
  );
};

export default Search;
