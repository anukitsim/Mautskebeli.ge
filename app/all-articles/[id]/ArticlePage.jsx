// app/all-articles/[id]/ArticlePage.jsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

async function fetchArticle(id) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

const ArticlePage = ({ params }) => {
  const [article, setArticle] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const getArticle = async () => {
      try {
        const fetchedArticle = await fetchArticle(params.id);
        setArticle(fetchedArticle);
      } catch (error) {
        console.error(error);
      }
    };
    getArticle();
  }, [params.id]);

  if (!isMounted || !article) {
    return <div>Loading...</div>;
  }

  return (
    <section className="w-full mx-auto mt-10 lg:mt-20 px-4 lg:px-0">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold mb-5">{article.title.rendered}</h1>
        <div className="w-full h-auto mb-5">
          <Image
            src={article.acf.image}
            alt={article.acf.title}
            width={800}
            height={450}
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
          />
          <h2 className="text-xl font-bold mb-5">{article.acf['ავტორი']}</h2>
        </div>
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.acf['main-text'] }}></div>
        {article.acf['შენიშვნები'] && (
          <div className="prose prose-lg max-w-none mt-10" dangerouslySetInnerHTML={{ __html: article.acf['შენიშვნები'] }}></div>
        )}
      </div>
    </section>
  );
};

export default ArticlePage;
