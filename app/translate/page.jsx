/**
 * This is the server component for /translate
 * It fetches initial data from WP, then renders ClientSideTranslate with that data.
 */

import ClientSideTranslate from "./ClientSideTranslate";

// Fetch initial translations server-side for page 1
async function fetchInitialTranslations() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani?acf_format=standard&per_page=10&page=1`,
    { cache: "no-store" } // disable caching
  );
  if (!res.ok) {
    throw new Error("Failed to fetch initial translations");
  }
  return res.json();
}

export default async function TranslatePage() {
  // Load the first page of posts server-side
  const initialTranslations = await fetchInitialTranslations();

  // Render the client component, passing initial data
  return <ClientSideTranslate initialTranslations={initialTranslations} />;
}
