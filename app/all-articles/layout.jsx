// app/all-articles/layout.jsx

import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from "next/head";

export default function RootLayout({ children, metadata }) {
  // Fallback metadata
  const defaultMetadata = {
    title: "Mautskebeli",
    description: "Default description for Mautskebeli.",
    image: "https://www.mautskebeli.ge/images/default-og-image.jpg", // Replace SVG with a valid PNG/JPEG image
    imageAlt: "Default image alt text",
    url: "https://www.mautskebeli.ge",
    fbAppId: "1819807585106457",
    locale: "ka_GE",
    siteName: "Mautskebeli",
  };

  // Merge provided metadata with defaults
  const finalMetadata = {
    ...defaultMetadata,
    ...metadata,
  };

  return (
    <html lang="en">
      <Head>
        {/* SEO Meta Tags */}
        <title>{finalMetadata.title}</title>
        <meta name="description" content={finalMetadata.description} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={finalMetadata.title} />
        <meta property="og:description" content={finalMetadata.description} />
        <meta property="og:image" content={finalMetadata.image} />
        <meta property="og:image:alt" content={finalMetadata.imageAlt} />
        <meta property="og:url" content={finalMetadata.url} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={finalMetadata.siteName} />
        <meta property="og:locale" content={finalMetadata.locale} />

        {/* Facebook-Specific Meta Tags */}
        <meta property="fb:app_id" content={finalMetadata.fbAppId} />
      </Head>
      <body>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
          {children}
          <Footer />
        </MenuProvider>
      </body>
    </html>
  );
}
