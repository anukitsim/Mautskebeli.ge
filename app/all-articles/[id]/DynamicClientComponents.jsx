// app/all-articles/[id]/DynamicClientComponents.jsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import client components with ssr: false
const ShareButtons = dynamic(() => import('./ShareButtons'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });

// The language switcher is no longer here: it is a server component
// (ArticleLanguageSwitcher.jsx) so its links work without JavaScript.
const DynamicClientComponents = ({ id, title, path, ui }) => {
  return (
    <>
      <ShareButtons
        articleId={id}
        title={title}
        path={path}
        labels={ui}
      />
      <ScrollToTopButton label={ui?.backToTop} />
    </>
  );
};

export default DynamicClientComponents;
