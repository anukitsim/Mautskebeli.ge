'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Search = ({ isSearchOpen, setIsSearchOpen, variant = 'default' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const isSport = variant === 'sport';

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
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="mr-7 p-1 rounded-lg hover:opacity-80 transition-opacity">
            {isSport ? (
              <svg className="w-6 h-6 text-[#474F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : (
              <Image src="/images/Search.svg" alt="Search" width={25} height={25} />
            )}
          </button>
        )}
      </div>

      {/* Mobile Search Input */}
      <div className={`${isSearchOpen ? 'flex' : 'hidden'} absolute top-[-5px] right-5 mt-1 mr-4 bg-white p-2 rounded-lg shadow-lg border border-[#E0DBE8] z-40`}>
        <input
          type="text"
          placeholder="ძიება..."
          className="text-[#474F7A] outline-none min-w-[140px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} type="submit" className="p-2 text-[#AD88C6] hover:bg-[#AD88C6]/10 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Desktop Search - Icon that expands */}
      <div ref={containerRef} className="hidden sm:flex items-center relative">
        <div 
          className={`flex items-center transition-all duration-300 ease-out ${
            isExpanded 
              ? isSport 
                ? 'w-[260px] overflow-hidden bg-white rounded-full shadow-lg border border-[#E0DBE8]' 
                : 'w-[260px] overflow-hidden bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/50' 
              : isSport 
                ? 'w-12 overflow-visible' 
                : 'w-10 overflow-hidden'
          }`}
        >
          <button 
            onClick={toggleSearch}
            className={`flex-shrink-0 rounded-full transition-all duration-200 ${
              isExpanded 
                ? 'text-[#AD88C6] hover:bg-[#AD88C6]/10 p-2.5' 
                : isSport 
                  ? 'p-2.5 bg-[#AD88C6]/25 hover:bg-[#FECE27]/90 hover:border-[#FECE27]/50 text-[#474F7A] border border-[#AD88C6]/30' 
                  : 'p-2.5 bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
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
