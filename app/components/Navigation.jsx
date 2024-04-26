"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenu } from '../context/MenuContext';

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const Navigation = ({ onVideoSelect }) => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const toggleMenu = () => {
    if (!isMenuOpen) setIsSearchOpen(false);
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'initial';
  };

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
        fetch(`http://mautskebeli.local/wp-json/wp/v2/${postType}?search=${encodeURIComponent(searchQuery)}`, {
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
    <nav className="bg-[#AD88C6] h-14 flex items-center sm:justify-center">
      <div className="w-full sm:w-10/12 mx-auto flex justify-between items-center relative">
        <div className="sm:hidden z-50 ml-7">
          <button onClick={toggleMenu}>
            <img src={isMenuOpen ? "/images/cross.svg" : "/images/hamburger.svg"} alt={isMenuOpen ? "Close" : "Menu"} width="30" height="30" />
          </button>
        </div>
        <ul className="hidden sm:flex gap-10 items-center text-white text-xs sm:text-sm">
          <Link href="/">მთავარი</Link>
          <Link href="/text">ტექსტი</Link>
          <Link href="/podcast">პოდკასტი</Link>
          <Link href="#">სპორტი</Link>
          <Link href="#">ჩვენს შესახებ</Link>
        </ul>
        <div className="sm:hidden z-50 ">
          <button onClick={toggleSearch} className="mr-7">
            <Image src="/images/search.png" alt="Search" width={25} height={25} />
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
          <ul className="flex pl-4 flex-col gap-4 items-left text-white text-xs">
          </ul>
        </div>
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
