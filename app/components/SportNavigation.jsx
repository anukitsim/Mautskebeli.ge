'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMenu } from '../context/MenuContext';

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const SportNavigation = ({ onVideoSelect }) => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

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

  const toggleSearch = () => {
    if (!isSearchOpen) setIsMenuOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const fetchSearchResults = async () => {
    const postTypes = ['mecniereba', 'medicina', 'msoflio', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
    try {
      const allFetchPromises = postTypes.map((postType) =>
        fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}?search=${encodeURIComponent(searchQuery)}`, {
          headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
      );

      const results = await Promise.allSettled(allFetchPromises);
      const successfulResults = results
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value)
        .filter((post) => post.acf && post.acf.video_url);

      const videoData = successfulResults.map((post) => ({
        id: post.id,
        title: post.title.rendered,
        videoId: extractVideoId(post.acf.video_url),
      }));

      setSearchResults(videoData);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    }
  };

  const SearchModal = ({ searchResults }) => (
    <div className="modal-background">
      <div className="modal">
        {searchResults.map((video) => (
          <div key={video.id} className="search-result" onClick={() => onVideoSelect(video.videoId)}>
            {video.title}
          </div>
        ))}
      </div>
    </div>
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchSearchResults();
    setIsSearchOpen(true);
  };

  return (
    <nav className="bg-[#FECE27] h-14 flex items-center sm:justify-center">
      <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative">
        <div className="sm:hidden z-50 ml-7">
          <button onClick={toggleMenu}>
            <img src={isMenuOpen ? "/images/cross-white.svg" : "/images/hamburger.svg"} alt={isMenuOpen ? "Close" : "Menu"} width="30" height="30" />
          </button>
        </div>
        <ul className="hidden sm:flex gap-10 items-center text-black text-xs sm:text-sm">
          <Link href="/">მთავარი</Link>
          <Link href="/text">ტექსტი</Link>
          <Link href="/podcast">პოდკასტი</Link>
          <Link href="/sporti" className='text-white'>სპორტი</Link>
          <Link href="/about-us">ჩვენს შესახებ</Link>
        </ul>
        <div className="sm:hidden z-50">
          <button onClick={toggleSearch} className="mr-7">
            <Image src="/images/search-white.png" alt="Search" width={25} height={25} />
          </button>
        </div>
        <div className={`${isSearchOpen ? "flex" : "hidden"} absolute top-full right-5 mt-1 mr-4 bg-white p-2 rounded-md shadow-lg z-40`}>
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
        {isSearchOpen && searchResults.length > 0 && <SearchModal searchResults={searchResults} />}
        <div className={`${isMenuOpen ? "fixed" : "hidden"} top-32 left-0 h-full w-full bg-[#AD88C6] p-4 sm:hidden z-50 overflow-y-auto`}>
          <div className='text-white text-[15px] ml-7 flex gap-2 flex-col'>
          <Link href="/">მთავარი</Link>
          <Link href="/text">ტექსტი</Link>
          <Link href="/podcast">პოდკასტი</Link>
          <Link href="#">სპორტი</Link>
          <Link href="#">ჩვენს შესახებ</Link>
          </div>
          <button onClick={toggleCategories} className="text-white ml-7 text-[15px] mt-2  mb-4 flex items-center gap-2">
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
        <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2.5 bg-[#AD88C6] rounded h-9 md:w-[340px]">
          <button type="submit" className="p-2 bg-[#AD88C6] rounded-full">
            <Image src="/images/search-yellow.png" alt="Search" width={20} height={20} />
          </button>
          <input
            type="text"
            placeholder=""
            className="flex-1 px-4 text-[#474F7A] rounded-full bg-[#AD88C6] border-none outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </nav>
  );
};

export default SportNavigation;
