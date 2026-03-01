'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SearchVideoCard from '../components/SearchVideoCard';

const H_OPEN = '\u0000H\u0000';
const H_CLOSE = '\u0000/h\u0000';

function toHtml(str) {
  if (!str || typeof str !== 'string') return '';
  const parts = str.split(H_OPEN);
  return parts
    .map((part) => {
      const i = part.indexOf(H_CLOSE);
      if (i === -1) return escapeHtml(part);
      const matched = part.slice(0, i);
      const rest = part.slice(i + H_CLOSE.length);
      return `<mark class="search-hl">${escapeHtml(matched)}</mark>${toHtml(rest)}`;
    })
    .join('');
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const BADGE = {
  title: { label: 'სათაური', cls: 'bg-[#474F7A]/15 text-[#474F7A] border-[#474F7A]/30' },
  author: { label: 'ავტორი', cls: 'bg-[#AD88C6]/20 text-[#5F4AA5] border-[#AD88C6]/50' },
  content: { label: 'ტექსტი', cls: 'bg-[#FECE27]/20 text-[#8B7300] border-[#FECE27]/50' },
};

function Badges({ matchedIn }) {
  if (!matchedIn?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {matchedIn.map((k) => {
        const b = BADGE[k];
        if (!b) return null;
        return (
          <span
            key={k}
            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${b.cls}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1" aria-hidden />
            {b.label}
          </span>
        );
      })}
    </div>
  );
}

function ResultCard({ item }) {
  const titleHtml = toHtml(item.titleHighlighted || item.title || '');
  const authorHtml = item.authorHighlighted ? toHtml(item.authorHighlighted) : null;
  const excerptHtml = item.excerptHighlighted ? toHtml(item.excerptHighlighted) : null;

  return (
    <Link href={item.link} className="block group">
      <div className="bg-white rounded-xl border border-[#E0DBE8] overflow-hidden hover:shadow-lg hover:border-[#AD88C6]/50 transition-all duration-200">
        <div className="relative w-full h-[190px] bg-[#F6F4F8]">
          <Image
            src={item.imageUrl || '/images/default-og-image.jpg'}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="p-4">
          <Badges matchedIn={item.matchedIn} />
          <h3
            className="text-[17px] leading-snug font-bold text-[#474F7A] mb-1.5 line-clamp-2 group-hover:text-[#AD88C6] transition-colors"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          {item.author && (
            <p className="text-[13px] font-semibold text-[#8D91AB] mb-1.5">
              {authorHtml ? (
                <span dangerouslySetInnerHTML={{ __html: authorHtml }} />
              ) : (
                item.author
              )}
            </p>
          )}
          {item.excerpt && (
            <p className="text-[13px] leading-relaxed text-[#555] line-clamp-3">
              {excerptHtml ? (
                <span dangerouslySetInnerHTML={{ __html: excerptHtml }} />
              ) : (
                item.excerpt
              )}
            </p>
          )}
          <span className="inline-block mt-3 text-[13px] font-semibold text-[#AD88C6] group-hover:underline">
            ნახეთ სრულად →
          </span>
        </div>
      </div>
    </Link>
  );
}

function VideoCard({ video, onSelect }) {
  const titleHtml = toHtml(video.titleHighlighted || video.title || '');
  return (
    <div className="flex-shrink-0">
      <SearchVideoCard
        videoId={video.videoId}
        caption={video.title}
        onSelect={() => onSelect(video)}
      />
      <p
        className="mt-1.5 text-[13px] text-[#474F7A] font-medium line-clamp-2 px-1"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
    </div>
  );
}

const SECTIONS = [
  { key: 'videos', title: 'ვიდეოები' },
  { key: 'news', title: 'ამბები' },
  { key: 'articles', title: 'სტატიები' },
  { key: 'translations', title: 'თარგმანი' },
  { key: 'freeColumns', title: 'თავისუფალი სვეტი' },
  { key: 'books', title: 'წიგნები' },
  { key: 'sportArticles', title: 'სპორტი' },
];

const Loader = () => (
  <div className="flex justify-center items-center py-12">
    <img src="/images/loader.svg" alt="loading" />
  </div>
);

function SearchResults({ searchQuery }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoPage, setVideoPage] = useState(1);
  const router = useRouter();

  const videosPerPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6;

  const fetchResults = useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        setError('ძიება ვერ მოხერხდა');
        setData(null);
      } else {
        setData(await res.json());
      }
    } catch {
      setError('ძიება ვერ მოხერხდა');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchResults();
    setVideoPage(1);
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

  if (loading) return <Loader />;

  if (!searchQuery || searchQuery.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-[#474F7A] text-lg">შეიყვანეთ მინიმუმ 2 სიმბოლო ძიებისთვის.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const total = data
    ? SECTIONS.reduce((sum, s) => sum + (data[s.key]?.length || 0), 0)
    : 0;

  const videos = data?.videos || [];
  const vStart = (videoPage - 1) * videosPerPage;
  const vSlice = videos.slice(vStart, vStart + videosPerPage);
  const totalVPages = Math.ceil(videos.length / videosPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-baseline gap-2 mb-1">
        <h1 className="text-[22px] font-bold text-[#474F7A]">
          ძიება: &ldquo;{searchQuery}&rdquo;
        </h1>
        <span className="text-[15px] text-[#8D91AB]">
          — {total} შედეგი
        </span>
      </div>
      <p className="text-[13px] text-[#9B8FB0] mb-6">
        ნაჩვენებია შედეგები, სადაც საძიებო სიტყვა გვხვდება სათაურში, ავტორში ან ტექსტში.
        მონიშნული ყვითლად.
      </p>

      {total === 0 && (
        <div className="mt-8 py-16 text-center rounded-xl border border-[#E0DBE8] bg-[#FAFAFA]">
          <p className="text-[20px] font-semibold text-[#474F7A] mb-2">
            შედეგები ვერ მოიძებნა
          </p>
          <p className="text-[15px] text-[#8D91AB] max-w-md mx-auto">
            სცადეთ სხვა საძიებო სიტყვა ან შეამოწმეთ მართლწერა.
          </p>
        </div>
      )}

      {SECTIONS.map(({ key, title }) => {
        const items = data?.[key] || [];
        if (items.length === 0) return null;

        if (key === 'videos') {
          return (
            <section key={key} className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[20px] font-bold text-[#474F7A]">{title}</h2>
                {totalVPages > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                      disabled={videoPage === 1}
                      className="p-1.5 rounded-full bg-[#F6F4F8] hover:bg-[#E0DBE8] disabled:opacity-40 transition"
                      aria-label="Previous"
                    >
                      <Image src="/images/videos-left.svg" alt="" width={24} height={24} />
                    </button>
                    <button
                      onClick={() => setVideoPage((p) => p + 1)}
                      disabled={videoPage >= totalVPages}
                      className="p-1.5 rounded-full bg-[#F6F4F8] hover:bg-[#E0DBE8] disabled:opacity-40 transition"
                      aria-label="Next"
                    >
                      <Image src="/images/videos-right.svg" alt="" width={24} height={24} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:overflow-visible"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {vSlice.map((v) => (
                  <VideoCard key={`v-${v.id}`} video={v} onSelect={handleVideoClick} />
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={key} className="mb-10">
            <h2 className="text-[20px] font-bold text-[#474F7A] mb-4">{title}</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ResultCard key={`${key}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.trim() || '';
  return <SearchResults searchQuery={query} />;
}

export default function WrappedSearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchPage />
    </Suspense>
  );
}
