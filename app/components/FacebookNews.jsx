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

const FacebookNews = async () => {
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

  return (
    <div className="flex flex-col md:flex-row gap-5 pb-6 items-start w-10/12 mx-auto lg:mt-10 mt-[350px]">
      {latestPosts?.map((post, index) => (
        <Link
          href={`/facebook-post/${index + 1}`}
          key={index}
          className="flex flex-col w-full md:w-1/4 border rounded-md p-5 lg:p-0 border-[#AD88C6] lg:border-none gap-3 items-start"
        >
          <div className="h-[80px]">
            <p className="text-sm font-light text-[#474F7A] self-stretch">
              {truncate(post.caption, 5)}
            </p>
          </div>
          <button className="text-xs items-end font-medium text-white py-1 px-3 rounded bg-[#AD88C6]">
           ვრცლად
          </button>
        </Link>
      ))}
    </div>
  );
};

export default FacebookNews;
