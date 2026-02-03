'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Search */}
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
          placeholder="ძიება..."
          className="text-black outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} type="submit" className="p-2">
          <Image src="/images/Search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>

      {/* Desktop Search - Icon that expands */}
      <div ref={containerRef} className="hidden sm:flex items-center relative">
        <div 
          className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
            isExpanded 
              ? 'w-[260px] bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/50' 
              : 'w-10'
          }`}
        >
          {/* Search Icon Button */}
          <button 
            onClick={toggleSearch}
            className={`flex-shrink-0 p-2.5 rounded-full transition-all duration-200 ${
              isExpanded 
                ? 'text-[#AD88C6] hover:bg-[#AD88C6]/10' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
        </button>

          {/* Input field - only visible when expanded */}
          <form onSubmit={handleSearch} className={`flex-1 ${isExpanded ? 'block' : 'hidden'}`}>
        <input
              ref={inputRef}
          type="text"
              placeholder="ძიება..."
              className="w-full py-2 pr-4 text-[#474F7A] placeholder:text-[#9B8FB0] bg-transparent border-none outline-none text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
        </div>
      </div>
    </>
  );
};

export default Search;
