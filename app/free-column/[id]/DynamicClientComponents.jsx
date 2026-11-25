// app/free-column/[id]/DynamicClientComponents.jsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import client components with ssr: false
const ShareButtons = dynamic(() => import('./ShareButtons'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });

// The language switch is now ArticleLanguageSwitcher (server component,
// shared with articles) in page.jsx; the old dropdown linked to /ENG and
// /RU pages that did not exist for free columns.
const DynamicClientComponents = ({ id, title }) => {
  return (
    <>
      <ShareButtons freeColumnId={id} title={title} />
      <ScrollToTopButton />
    </>
  );
};

export default DynamicClientComponents;
