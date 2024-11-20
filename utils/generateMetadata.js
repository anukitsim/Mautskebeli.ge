// app/utils/generateMetadata.js

import { decode } from 'html-entities';

export async function generateContentMetadata(content, type = 'article') {
  if (!content) {
    return {
      title: `${capitalizeFirstLetter(type)} Not Found`,
      description: `This ${type} does not exist.`,
      openGraph: {
        title: `${capitalizeFirstLetter(type)} Not Found`,
        description: `This ${type} does not exist.`,
        image: 'https://www.mautskebeli.ge/images/og-logo.jpg',
        url: `https://www.mautskebeli.ge/${type}`,
        type: 'article',
      },
    };
  }

  const decodedTitle = decode(content.title.rendered || '');
  const description = content.acf.description || content.acf.sub_title || 'Default description.';
  const decodedDescription = decode(description);

  let imageUrl = content.acf.image
    ? content.acf.image.startsWith('http')
      ? content.acf.image
      : `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${content.acf.image}`
    : 'https://www.mautskebeli.ge/images/default-og-image.jpg'; // Default image

  // Remove any query parameters that might cause issues
  imageUrl = imageUrl.split('?')[0];

  const metadataBase = new URL('https://www.mautskebeli.ge');

  // Optional: Add your Facebook App ID to eliminate warnings
  const fbAppId = 'YOUR_FB_APP_ID'; // Replace with your actual Facebook App ID

  return {
    metadataBase, // Ensures relative URLs are resolved correctly
    title: decodedTitle,
    description: decodedDescription,
    openGraph: {
      title: decodedTitle,
      description: decodedDescription,
      url: `https://www.mautskebeli.ge/${type}/${content.id}`, // Absolute URL
      type: 'article',
      images: [
        {
          url: imageUrl,
          alt: decodedTitle,
        },
      ],
      locale: 'ka_GE',
      siteName: 'Mautskebeli',
      ...(fbAppId && { 'fb:app_id': fbAppId }), // Conditionally add fb:app_id
    },
    twitter: {
      card: 'summary_large_image',
      title: decodedTitle,
      description: decodedDescription,
      images: [imageUrl],
    },
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
