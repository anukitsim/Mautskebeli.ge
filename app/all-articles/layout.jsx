// app/all-articles/layout.jsx

import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export default function RootLayout({ children, metadata }) {
  const defaultMetadata = {
    title: "Default Title",
    description: "Default description",
    additionalMetaTags: [
      { property: 'fb:app_id', content: '1819807585106457' },
      { property: 'og:site_name', content: 'Mautskebeli' },
      { property: 'og:locale', content: 'ka_GE' }, // Ensure correct locale
      { property: 'article:publisher', content: '100041686795244' } // Example FB Page ID
    ],
  };

  const finalMetadata = metadata || defaultMetadata;

 

  return (
    <html lang="en">
      <Head>
        <title>{finalMetadata.title}</title>
        <meta name="description" content={finalMetadata.description} />
        {finalMetadata.additionalMetaTags.map((tag) => (
          <meta key={tag.property} property={tag.property} content={tag.content} />
        ))}
        {/* Removed OG meta tags from layout to prevent conflicts */}
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
