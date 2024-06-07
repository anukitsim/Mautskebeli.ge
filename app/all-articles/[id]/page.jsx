// app/all-articles/[id]/page.jsx
import dynamic from 'next/dynamic';

const NoSSRArticlePage = dynamic(() => import('./ArticlePage'), { ssr: false });

const Page = ({ params }) => {
  return <NoSSRArticlePage params={params} />;
};

export default Page;