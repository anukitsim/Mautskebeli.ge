import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    console.error('Missing article ID');
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  try {
    const apiUrl = `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${id}?acf_format=standard&_fields=id,title,acf,date`;
    console.log(`Fetching article from: ${apiUrl}`);
    
    const res = await fetch(apiUrl);

    if (!res.ok) {
      console.error(`Error fetching article: ${res.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch article' }, { status: res.status });
    }

    const article = await res.json();
    console.log('Fetched article:', article);

    if (!article.acf) {
      console.error('ACF fields missing in article:', article);
      return NextResponse.json({ error: 'ACF fields missing in article' }, { status: 500 });
    }

    const stripHtmlTags = (str) => {
      if (!str) return '';
      return str.replace(/<\/?[^>]+(>|$)/g, '');
    };

    const ogTags = {
      title: article.title.rendered,
      description: article.acf['main-text'] ? stripHtmlTags(article.acf['main-text']).slice(0, 150) : '',
      url: `https://www.mautskebeli.ge/all-articles/${article.id}`,
      image: article.acf.image ? article.acf.image : '/images/og-logo.jpg',
    };

    console.log('Generated OG tags:', ogTags);

    return NextResponse.json(ogTags);

  } catch (error) {
    console.error('Unexpected error:', error.message);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
