"use client";

import dynamic from "next/dynamic";

// Dynamically import client components
const ShareButtons = dynamic(() => import("./ShareButtons"), { ssr: false });

const ScrollToTopButton = dynamic(() => import("./ScrollToTopButton"), {
  ssr: false,
});

const DynamicClientComponents = ({ id, title }) => {
  return (
    <>
      <ShareButtons articleId={id} title={title} />

      <ScrollToTopButton />
    </>
  );
};

export default DynamicClientComponents;
