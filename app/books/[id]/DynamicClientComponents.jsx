'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ShareButtons = dynamic(() => import('./ShareButtons'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });

const DynamicClientComponents = ({ id, title }) => {
  return (
    <>
      <ShareButtons bookId={id} title={title} />
      <ScrollToTopButton />
    </>
  );
};

export default DynamicClientComponents;
