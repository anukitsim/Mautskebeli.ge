'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchVideoCard from '../components/SearchVideoCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const extractVideoId = (videoUrl) => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/|v|e(?:mbed)?)\/|.*[?&]v=|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const truncateText = (text, limit) => {
  const words = text.split(' ');
  if (words.length > limit) {
    return words.slice(0, limit).join(' ') + '...';
  }
  return text;
};

const fetchImageUrl = async (imageId) => {
  if (!imageId) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/media/${imageId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched Image URL:', data.source_url);
    return data.source_url;
  } catch (error) {
    console.error('Failed to fetch image URL:', error);
    return null;
  }
};



const CustomLoader = () => (
  <div className="flex justify-center items-center mt-4">
    <img src="/images/loader.svg" alt="loading" />
  </div>
);

const SearchResults = ({ searchQuery }) => {
  const [videoResults, setVideoResults] = useState([]);
  const [articleResults, setArticleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const videoPostTypes = [
        'mecniereba',
        'medicina',
        'msoflio',
        'saxli',
        'kalaki',
        'shroma',
        'xelovneba',
      ];
      const articlePostTypes = ['article', 'targmani'];

      try {
        // Fetch video results
        const videoFetchPromises = videoPostTypes.map((postType) =>
          fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}?search=${encodeURIComponent(
              searchQuery
            )}`,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          ).then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
        );

        const videoResultsData = await Promise.allSettled(videoFetchPromises);
        const successfulVideoResults = videoResultsData
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
          .filter((post) => post.acf && post.acf.video_url);

        const videoData = successfulVideoResults.map((post) => ({
          id: post.id,
          title: post.title.rendered,
          videoId: extractVideoId(post.acf.video_url),
          postType: post.type,
        }));

        // Fetch article results
        const articleFetchPromises = articlePostTypes.map((postType) =>
          fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/${postType}?search=${encodeURIComponent(
              searchQuery
            )}`,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          ).then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
        );

        const articleResultsData = await Promise.allSettled(
          articleFetchPromises
        );
        const successfulArticleResults = articleResultsData
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value);

        const articleData = await Promise.all(
          successfulArticleResults.map(async (post) => {
            const imageUrl = await fetchImageUrl(post.acf?.image);
            return {
              id: post.id,
              title: post.title.rendered,
              acf: { ...post.acf, image: imageUrl },
              postType: post.type,
            };
          })
        );

        setVideoResults(videoData);
        setArticleResults(articleData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  const handleVideoPageChange = (newPage) => {
    setCurrentVideoPage(newPage);
  };

  const handleArticlePageChange = (newPage) => {
    setCurrentArticlePage(newPage);
  };

  const videoStartIndex = (currentVideoPage - 1) * (isMobile ? 4 : Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 250)));
  const videoEndIndex = videoStartIndex + (isMobile ? 4 : Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 250)));
  const paginatedVideoResults = videoResults.slice(videoStartIndex, videoEndIndex);

  const articleStartIndex = (currentArticlePage - 1) * (isMobile ? 4 : Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 300)));
  const articleEndIndex = articleStartIndex + (isMobile ? 4 : Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 300)));
  const paginatedArticleResults = articleResults.slice(articleStartIndex, articleEndIndex);

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-10 p-3 w-full" style={{ borderRadius: '4px', border: '1px solid #E0DBE8' }}>
        <span className="text-[16px] font-noto-sans-georgian text-[#474F7A]">
          {videoResults.length + articleResults.length} შედეგი სიტყვაზე "{searchQuery}"
        </span>
      </div>

      {videoResults.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[24px] font-bold font-noto-sans-georgian text-[#474F7A] pt-10 pb-10">ვიდეო</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleVideoPageChange(Math.max(1, currentVideoPage - 1))}
                disabled={currentVideoPage === 1}
                className="bg-white rounded-full p-2"
              >
                <Image src="/images/videos-left.png" alt="Previous" width={32} height={32} />
              </button>
              <button
                onClick={() => handleVideoPageChange(currentVideoPage + 1)}
                disabled={videoEndIndex >= videoResults.length}
                className="bg-white rounded-full p-2"
              >
                <Image src="/images/videos-right.png" alt="Next" width={32} height={32} />
              </button>
            </div>
          </div>
          <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
            {paginatedVideoResults.map((video) => (
              <div key={video.id} className="flex-shrink-0">
                <SearchVideoCard
                  videoId={video.videoId}
                  caption={video.title}
                  onSelect={(videoId) => router.push(`/${video.postType}?videoId=${videoId}`)}
                />
              </div>
            ))}
          </div>
          <div className="flex md:hidden gap-4 overflow-x-auto hide-scroll-bar">
            {paginatedVideoResults.map((video) => (
              <div key={video.id} className="flex-shrink-0 w-[250px] mr-4">
                <SearchVideoCard
                  videoId={video.videoId}
                  caption={video.title}
                  onSelect={(videoId) => router.push(`/${video.postType}?videoId=${videoId}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {articleResults.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[24px] font-bold font-noto-sans-georgian text-[#474F7A] pt-10 pb-10">სტატიები</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleArticlePageChange(Math.max(1, currentArticlePage - 1))}
                disabled={currentArticlePage === 1}
                className="bg-white rounded-full p-2"
              >
                <Image src="/images/videos-left.png" alt="Previous" width={32} height={32} />
              </button>
              <button
                onClick={() => handleArticlePageChange(currentArticlePage + 1)}
                disabled={articleEndIndex >= articleResults.length}
                className="bg-white rounded-full p-2"
              >
                <Image src="/images/videos-right.png" alt="Next" width={32} height={32} />
              </button>
            </div>
          </div>
          <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))` }}>
            {paginatedArticleResults.map((article) => (
              <Link href={`/all-articles/${article.id}`} passHref key={article.id} className="flex-shrink-0">
                <div
                  className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden"
                  style={{ minWidth: '300px', width: '100%' }}
                >
                  <div className="article-image-container relative w-full h-[200px]">
                    {article.acf?.image ? (
                      <Image
                        src={article.acf.image}
                        alt="article-cover"
                        
                        fill
                        sizes="(max-width: 300px) 100vw, (max-width: 1024px) 50vw, 33vw, (min-width: 1200px) 25vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    ) : (
                      <Image
                        src="/images/default-image.png"
                        alt="article-cover"
                        fill
                        sizes="(max-width: 300px) 100vw, (max-width: 1024px) 50vw, 33vw, (min-width: 1200px) 25vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    )}
                  </div>
                  <div className="p-[18px]">
                    <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                      {article.title}
                    </h2>
                    <span className="text-[#8D91AB] text-[14px] font-bold">
                      {truncateText(article.acf?.title || '', 10)}
                    </span>
                    <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
                      {truncateText(stripHtml(article.acf?.['main-text'] || ''), 30)}
                    </p>
                    <div className="flex flex-col justify-end pt-[30px] items-end">
                      <span className="text-[15px] text-[#AD88C6]">
                        {article.acf?.translator || ''}
                      </span>
                      <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                        ნახეთ სრულად
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex md:hidden gap-4 overflow-x-auto hide-scroll-bar">
            {paginatedArticleResults.map((article) => (
              <Link href={`/all-articles/${article.id}`} passHref key={article.id} className="flex-shrink-0 w-[300px] mr-4">
                <div
                  className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden"
                  style={{ minWidth: '300px', width: '300px' }}
                >
                  <div className="article-image-container relative w-full h-[200px]">
                    {article.acf?.image ? (
                      <Image
                        src={article.acf.image}
                        alt="article-cover"
                        fill
                        sizes="(max-width: 300px) 100vw, (max-width: 1024px) 50vw, 33vw, (min-width: 1200px) 25vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    ) : (
                      <Image
                        src="/images/default-image.png"
                        alt="article-cover"
                        fill
                        sizes="(max-width: 300px) 100vw, (max-width: 1024px) 50vw, 33vw, (min-width: 1200px) 25vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    )}
                  </div>
                  <div className="p-[18px]">
                    <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
                      {article.title}
                    </h2>
                    <span className="text-[#8D91AB] text-[14px] font-bold">
                      {truncateText(article.acf?.title || '', 10)}
                    </span>
                    <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
                      {truncateText(stripHtml(article.acf?.['main-text'] || ''), 30)}
                    </p>
                    <div className="flex flex-col justify-end pt-[30px] items-end">
                      <span className="text-[15px] text-[#AD88C6]">
                        {article.acf?.translator || ''}
                      </span>
                      <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                        ნახეთ სრულად
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {videoResults.length === 0 && articleResults.length === 0 && (
        <p className="mt-4">No results found.</p>
      )}
    </div>
  );
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query');

  return <SearchResults searchQuery={searchQuery} />;
};

const WrappedSearchPage = () => (
  <Suspense fallback={<CustomLoader />}>
    <SearchPage />
  </Suspense>
);

export default WrappedSearchPage;
