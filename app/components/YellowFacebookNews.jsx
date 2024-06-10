import Link from 'next/link';
import React from 'react';
import { fetchFacebookData } from '../../utils/fetchFacebookData';

function truncate(text, maxWords) {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
}

const YellowFacebookNews = async ({ currentPostId }) => {
  let error, latestPosts;

  try {
    latestPosts = await fetchFacebookData();
  } catch (err) {
    console.error('Error fetching or processing data:', err.message);
    error = 'Error fetching or processing data. Please try again later.';
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Filter out the current post
  const filteredPosts = latestPosts.filter((_, index) => index + 1 !== currentPostId);

  return (
    <>
      <div className="w-full sm:w-10/12 flex items-center justify-between lg:mt-20 mt-[10px] mx-auto pl-10 pr- lg:pl-2 lg:pr-2">
        <p className="text-[#474F7A] text-[24px] font-bold">ბოლო ამბები</p>
      </div>
      <div className="flex flex-col md:flex-row gap-5 pb-6 items-start w-10/12 mx-auto lg:mt-10 mt-[350px]">
        {filteredPosts.slice(0, 3).map((post, index) => (
          <Link
            href={`/facebook-post/${latestPosts.findIndex(p => p === post) + 1}`}
            key={index}
            className="flex flex-col w-full md:w-1/4 border rounded-md p-5 lg:p-0 border-[#AD88C6] lg:border-none gap-3 items-start"
          >
            <div className="h-[80px]">
              <p className="text-sm font-light text-[#474F7A] self-stretch">
                {truncate(post.caption, 10)}
              </p>
            </div>
            <button className="text-xs items-end font-medium text-white py-1 px-3 rounded bg-[#AD88C6]">
              ვრცლად
            </button>
          </Link>
        ))}
      </div>
    </>
  );
};

export default YellowFacebookNews;
