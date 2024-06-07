'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchVideoCard from '../components/SearchVideoCard'; // Ensure this path is correct
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

const SearchResults = ({ searchQuery }) => {
  const [videoResults, setVideoResults] = useState([]);
  const [articleResults, setArticleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        'ekonomika',
        'resursebi',
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

        const articleData = successfulArticleResults.map((post) => ({
          id: post.id,
          title: post.title.rendered,
          acf: post.acf,
          postType: post.type,
        }));

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div
        className="flex items-center gap-10 p-3"
        style={{
          width: '580px',
          borderRadius: '4px',
          border: '1px solid #E0DBE8',
        }}
      >
        <span className="text-[16px] font-noto-sans-georgian text-[#474F7A]">
          {videoResults.length + articleResults.length} შედეგი სიტყვაზე "
          {searchQuery}"
        </span>
      </div>

      {videoResults.length > 0 && (
        <div>
          <h2 className="text-[16px] font-noto-sans-georgian text-[#474F7A]">
            ვიდეო
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {videoResults.map((video) => (
              <SearchVideoCard
                key={video.id}
                videoId={video.videoId}
                caption={video.title}
                onSelect={(videoId) =>
                  router.push(`/${video.postType}?videoId=${videoId}`)
                }
              />
            ))}
          </div>
        </div>
      )}
      {articleResults.length > 0 && (
        <div className="mt-4">
          <h2 className="text-[16px] font-noto-sans-georgian text-[#474F7A]">
            სტატიები
          </h2>
          <div className="grid gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {articleResults.map((article) => (
              <Link
                href={`/all-articles/${article.id}`}
                passHref
                key={article.id}
              >
                <div
                  className="article bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden"
                  style={{ minWidth: '300px' }}
                >
                  <div className="article-image-container relative w-full h-[200px]">
                    {article.acf?.image ? (
                      <Image
                        src={article.acf.image}
                        alt="article-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    ) : (
                      <Image
                        src="/images/default-image.png"
                        alt="article-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="article-image"
                        priority
                      />
                    )}
                  </div>
                  <div className="p-[18px]">
                    <h2
                      className="text-[20px] font-bold mb-2"
                      style={{ color: '#474F7A' }}
                    >
                      {article.title}
                    </h2>
                    <span className="text-[#8D91AB] text-[14px] font-bold">
                      {truncateText(article.acf?.title || '', 10)}
                    </span>
                    <p
                      className="text-sm pt-[18px]"
                      style={{ color: '#000' }}
                    >
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
  <Suspense fallback={<div>Loading...</div>}>
    <SearchPage />
  </Suspense>
);

export default WrappedSearchPage;
