"use client";

import dynamic from "next/dynamic";

// Dynamically import client components if needed
// Example: some share buttons or scroll button
// Adjust these imports to match your actual local files
const ShareButtons = dynamic(() => import("./ShareButtons"), { ssr: false });
const ScrollToTopButton = dynamic(() => import("./ScrollToTopButton"), {
  ssr: false,
});

/**
 * Renders client-side functionality
 */
export default function DynamicClientComponents({ id, title }) {
  return (
    <>
      <ShareButtons articleId={id} title={title} />
      <ScrollToTopButton />
    </>
  );
}
