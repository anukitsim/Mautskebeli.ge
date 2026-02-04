'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchVideoCard from '../components/SearchVideoCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const truncateText = (text, limit) => {
  if (!text) return '';
  const words = String(text).split(' ');
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
};

const CustomLoader = () => (
  <div className="flex justify-center items-center mt-4">
    <img src="/images/loader.svg" alt="loading" />
  </div>
);

const CONTENT_SECTIONS = [
  { key: 'videos', title: 'ვიდეო', path: 'videos' },
  { key: 'news', title: 'ამბები', path: 'news' },
  { key: 'articles', title: 'სტატიები', path: 'articles' },
  { key: 'translations', title: 'თარგმანი', path: 'translations' },
  { key: 'freeColumns', title: 'თავისუფალი სვეტი', path: 'freeColumns' },
  { key: 'books', title: 'მაუწყებელი წიგნები', path: 'books' },
  { key: 'sportArticles', title: 'სპორტის სტატიები', path: 'sportArticles' },
];

function ResultCard({ item }) {
  return (
    <Link href={item.link} className="flex-shrink-0 block">
      <div
        className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden hover:shadow-md transition-shadow"
        style={{ minWidth: '300px', width: '100%' }}
      >
        <div className="article-image-container relative w-full h-[200px]">
          <Image
            src={item.imageUrl || '/images/default-og-image.jpg'}
            alt=""
            fill
            sizes="(max-width: 300px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="article-image"
          />
        </div>
        <div className="p-[18px]">
          <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
            {item.title}
          </h2>
          {item.author && (
            <span className="text-[#8D91AB] text-[14px] font-bold block mb-1">
              {item.author}
            </span>
          )}
          {item.excerpt && (
            <p className="text-sm pt-[8px] text-[#000]">
              {truncateText(item.excerpt, 30)}
            </p>
          )}
          <div className="flex flex-col justify-end pt-[20px] items-end">
            <span className="text-[15px] text-[#AD88C6] font-semibold">
              ნახეთ სრულად
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const SearchResults = ({ searchQuery }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const videosPerPage = isMobile ? 4 : Math.max(4, typeof window !== 'undefined' ? Math.floor(window.innerWidth / 280) : 6);

  useEffect(() => {
    const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchResults = useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setData({ articles: [], news: [], videos: [], translations: [], freeColumns: [], books: [], sportArticles: [], meta: {} });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (!res.ok) {
        setData({ articles: [], news: [], videos: [], translations: [], freeColumns: [], books: [], sportArticles: [], meta: {} });
        setError(json.error || 'Search failed');
        setLoading(false);
        return;
      }
      setData(json);
    } catch (err) {
      setError('Search failed');
      setData({ articles: [], news: [], videos: [], translations: [], freeColumns: [], books: [], sportArticles: [], meta: {} });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleVideoClick = useCallback(
    (video) => {
      if (video.postType === 'sporti-videos') {
        router.push(`/all-sport-videos/${video.id}`);
      } else {
        router.push(`/${video.postType}?videoId=${video.videoId}`);
      }
    },
    [router]
  );

  if (loading) return <CustomLoader />;

  const hasQuery = searchQuery && searchQuery.length >= 2;
  const totalCount = data
    ? (data.articles?.length || 0) +
      (data.news?.length || 0) +
      (data.videos?.length || 0) +
      (data.translations?.length || 0) +
      (data.freeColumns?.length || 0) +
      (data.books?.length || 0) +
      (data.sportArticles?.length || 0)
    : 0;

  if (!hasQuery) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded border border-[#E0DBE8] p-6 text-center text-[#474F7A]">
          <p className="text-[16px]">შეიყვანეთ მინიმუმ 2 სიმბოლო ძიებისთვის.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const paginatedVideos = data?.videos || [];
  const videoStart = (currentVideoPage - 1) * videosPerPage;
  const videoSlice = paginatedVideos.slice(videoStart, videoStart + videosPerPage);
  const totalVideoPages = Math.ceil(paginatedVideos.length / videosPerPage);

  return (
    <div className="container mx-auto p-4">
      <div
        className="flex flex-wrap items-center gap-2 p-3 w-full rounded border border-[#E0DBE8]"
      >
        <span className="text-[16px] font-noto-sans-georgian text-[#474F7A]">
          {totalCount} შედეგი სიტყვაზე &quot;{searchQuery}&quot;
        </span>
      </div>

      {CONTENT_SECTIONS.map(({ key, title, path }) => {
        const items = data?.[path] || [];
        if (key === 'videos') {
          if (items.length === 0) return null;
          return (
            <div key={key} className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[24px] font-bold font-noto-sans-georgian text-[#474F7A] pt-6 pb-4">
                  {title}
                </h2>
                {totalVideoPages > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentVideoPage((p) => Math.max(1, p - 1))}
                      disabled={currentVideoPage === 1}
                      className="bg-white rounded-full p-2 disabled:opacity-50"
                      aria-label="Previous"
                    >
                      <Image src="/images/videos-left.svg" alt="" width={32} height={32} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentVideoPage((p) => p + 1)}
                      disabled={currentVideoPage >= totalVideoPages}
                      className="bg-white rounded-full p-2 disabled:opacity-50"
                      aria-label="Next"
                    >
                      <Image src="/images/videos-right.svg" alt="" width={32} height={32} />
                    </button>
                  </div>
                )}
              </div>
              <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {videoSlice.map((video) => (
                  <div key={`${video.postType}-${video.id}`} className="flex-shrink-0">
                    <SearchVideoCard
                      videoId={video.videoId}
                      caption={video.title}
                      onSelect={() => handleVideoClick(video)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex md:hidden gap-4 overflow-x-auto pb-2">
                {videoSlice.map((video) => (
                  <div key={`${video.postType}-${video.id}`} className="flex-shrink-0 w-[250px]">
                    <SearchVideoCard
                      videoId={video.videoId}
                      caption={video.title}
                      onSelect={() => handleVideoClick(video)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (items.length === 0) return null;

        return (
          <div key={key} className="mt-6">
            <h2 className="text-[24px] font-bold font-noto-sans-georgian text-[#474F7A] pt-6 pb-4">
              {title}
            </h2>
            <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {items.map((item) => (
                <ResultCard key={`${key}-${item.id}`} item={item} />
              ))}
            </div>
            <div className="flex md:hidden gap-4 overflow-x-auto pb-2">
              {items.map((item) => (
                <div key={`${key}-${item.id}`} className="flex-shrink-0 w-[300px]">
                  <ResultCard item={item} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {totalCount === 0 && (
        <div className="mt-8 p-6 rounded border border-[#E0DBE8] text-center text-[#474F7A]">
          <p className="text-[16px]">შედეგები ვერ მოიძებნა. სცადეთ სხვა საკვანძო სიტყვა ან ავტორი.</p>
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query')?.trim() || '';

  return <SearchResults searchQuery={searchQuery} />;
};

const WrappedSearchPage = () => (
  <Suspense fallback={<CustomLoader />}>
    <SearchPage />
  </Suspense>
);

export default WrappedSearchPage;
