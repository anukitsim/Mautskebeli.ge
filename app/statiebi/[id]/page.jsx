"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Footer from '@/app/components/Footer';

const ArticlePage = () => {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // Using a regular expression to extract the ID from the URL
    const match = window.location.pathname.match(/statiebi\/(\d+)/);
    const id = match ? match[1] : null;

    if (id) {
      const endpoint = `https://mautskebeli.local/wp-json/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date`;
      fetch(endpoint)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setArticle(data))
        .catch(error => console.error('Fetching error:', error));
    } else {
      console.error('Article ID is undefined after attempting to extract from URL');
    }
  }, []);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <>
     <div className='w-10/12 mx-auto flex flex-col'>
      <div className='flex justify-center items-center'>
        <Image src={article.acf.image} alt={article.title.rendered} width={800} height={450} />
      </div>
      <div className='text-left w-[80%] mx-auto text-[#474F7A] text-2xl mt-[56px] flex justify-center items-center'>
        <h1>{article.title.rendered}</h1>
      </div>
      <div className='text-[#474F7A] mt-[56px] w-[80%] mx-auto whitespace-pre-line'>
        {article.acf['main-text']}
      </div>
    </div>
    <Footer />
    </>
   
  );
};

export default ArticlePage;
