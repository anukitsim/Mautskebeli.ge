import dynamic from 'next/dynamic';

const NoSSRArticlePage = dynamic(() => import('./TargmaniPage'), { ssr: false });

async function getData(id) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/targmani/${id}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function Page({ params }) {
  const data = await getData(params.id);

  return <NoSSRArticlePage params={params} data={data} />;
}
