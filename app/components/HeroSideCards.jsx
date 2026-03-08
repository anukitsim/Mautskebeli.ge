import React from 'react';
import HeroSideCardsClient from './HeroSideCardsClient';

const VIDEO_POST_TYPES = [
  'kalaki', 'mecniereba', 'medicina', 'msoflio',
  'saxli', 'shroma', 'xelovneba', 'ekonomika',
  'resursebi', 'sporti-videos',
];

const extractVideoId = (videoUrl) => {
  if (!videoUrl) return null;
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const buildCardFromItem = (item) => {
  const isVideo = VIDEO_POST_TYPES.includes(item.post_type);
  const isPodcast = !!item.hero_card_custom_url && item.hero_card_custom_url.includes('/podcast');

  let href = '';
  if (item.hero_card_custom_url) {
    href = item.hero_card_custom_url;
  } else if (item.video_id) {
    href = `/${item.post_type}?videoId=${item.video_id}`;
  } else if (item.post_type === 'news' && item.slug) {
    href = `/news/${item.slug}`;
  } else if (item.post_type === 'article') {
    href = `/all-articles/${item.id}`;
  } else if (item.post_type === 'mau-books') {
    href = `/books/${item.id}`;
  } else if (item.post_type === 'free-column') {
    href = `/free-column/${item.id}`;
  } else if (item.post_type === 'targmani') {
    href = `/translate/${item.id}`;
  } else if (item.post_type === 'sport-article') {
    href = `/sport-articles/${item.id}`;
  } else {
    href = `/${item.post_type}/${item.id}`;
  }

  let cardImage = item.hero_card_image || item.image || '';
  if (!cardImage && item.video_id) {
    cardImage = `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`;
  }
  if (!cardImage) {
    cardImage = '/images/default-image.png';
  }

  let category = 'ამბები';
  let categoryType = 'news';
  if (isVideo) {
    category = 'ვიდეო';
    categoryType = 'video';
  } else if (isPodcast) {
    category = 'პოდკასტი';
    categoryType = 'podcast';
  } else if (item.post_type === 'article') {
    category = 'სტატია';
    categoryType = 'article';
  } else if (item.post_type === 'free-column') {
    category = 'თავისუფალი სვეტი';
    categoryType = 'article';
  } else if (item.post_type === 'mau-books') {
    category = 'წიგნები';
    categoryType = 'article';
  } else if (item.post_type === 'targmani') {
    category = 'თარგმანი';
    categoryType = 'article';
  } else if (item.post_type === 'sport-article') {
    category = 'სპორტი';
    categoryType = 'article';
  }

  return {
    id: item.id,
    title: item.title,
    date: item.date,
    image: cardImage,
    href,
    category,
    categoryType,
    videoId: item.video_id || null,
    order: item.hero_card_order || 1,
  };
};

async function fetchFallbackCards() {
  const cards = [];

  try {
    const [newsRes, videoRes] = await Promise.all([
      fetch(
        'https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/news?per_page=1',
        { next: { revalidate: 60 } }
      ),
      fetch(
        'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/mecniereba?per_page=1&orderby=date&order=desc',
        { next: { revalidate: 60 } }
      ),
    ]);

    if (newsRes.ok) {
      const newsData = await newsRes.json();
      const list = Array.isArray(newsData) ? newsData : newsData.news || [];
      if (list.length > 0) {
        const n = list[0];
        cards.push({
          id: n.id,
          title: n.title,
          date: n.date,
          image: n.acf?.image || '/images/default-image.png',
          href: `/news/${n.slug}`,
          category: 'ამბები',
          categoryType: 'news',
          videoId: null,
          order: 1,
        });
      }
    }

    if (videoRes.ok) {
      const videos = await videoRes.json();
      if (videos.length > 0) {
        const v = videos[0];
        const videoId = extractVideoId(v.acf?.video_url);
        cards.push({
          id: v.id,
          title: v.acf?.title || v.title?.rendered || '',
          date: v.date,
          image: videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : v.acf?.image || '/images/default-image.png',
          href: `/${v.type}?videoId=${videoId}`,
          category: 'ვიდეო',
          categoryType: 'video',
          videoId,
          order: 2,
        });
      }
    }
  } catch (err) {
    console.error('HeroSideCards fallback fetch error:', err);
  }

  return cards;
}

const HeroSideCards = async () => {
  let cards = [];

  try {
    const res = await fetch(
      'https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/hero-cards',
      { next: { revalidate: 60 } }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cards = data.map(buildCardFromItem);
      }
    }
  } catch (err) {
    console.error('HeroSideCards fetch error:', err);
  }

  if (cards.length === 0) {
    cards = await fetchFallbackCards();
  }

  return <HeroSideCardsClient cards={cards} />;
};

export default HeroSideCards;
