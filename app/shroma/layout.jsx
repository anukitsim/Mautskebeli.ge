import React from "react";
import Head from "next/head";
import Footer from "../components/Footer";
import "../../style/globals.css"

export default function RootLayout({ children, pageMeta }) {
  return (
    <html lang="en">
      <Head>
        <title>{pageMeta?.title || "Default Title"}</title>
        <meta name="description" content={pageMeta?.description || "Default description"} />
        {/* Open Graph tags */}
        <meta property="og:title" content={pageMeta?.title || "Default Title"} />
        <meta property="og:description" content={pageMeta?.description || "Default description"} />
        <meta property="og:image" content={pageMeta?.image || "/default-image.jpg"} />
        <meta property="og:url" content={pageMeta?.url || "http://www.example.com"} />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="/style/globals.css" />
      </Head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
