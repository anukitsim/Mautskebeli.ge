import dynamic from 'next/dynamic';

const NoSSRBookPage = dynamic(() => import('./BookPage'), { ssr: false });

async function getData(id) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mau-books/${id}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function Page({ params }) {
  const data = await getData(params.id);

  return <NoSSRBookPage params={params} data={data} />;
}
