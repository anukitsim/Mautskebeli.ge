// app/all-articles/[id]/DynamicClientComponents.jsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import client components with ssr: false
const ShareButtons = dynamic(() => import('./ShareButtons'), { ssr: false });
const LanguageDropdown = dynamic(() => import('./LanguageDropdown'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });

const DynamicClientComponents = ({
  id,
  title,
  showLanguageDropdown,
  hasEng,
  hasRu,
  currentLanguage,
}) => {
  return (
    <>
      <ShareButtons articleId={id} title={title} />
      {showLanguageDropdown && (
        <LanguageDropdown
        id={id}
        currentLanguage={currentLanguage}
        hasEng={hasEng}
        hasRu={hasRu}
        />
      )}
      <ScrollToTopButton />
    </>
  );
};

export default DynamicClientComponents;
