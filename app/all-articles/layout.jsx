// all-articles/layout.jsx

import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export default function RootLayout({ children, metadata }) {
  // Ensure `fb:app_id` is directly included as a default
  const defaultMetadata = {
    title: "Default Title",
    description: "Default description",
    openGraph: {
      title: "Default OG Title",
      description: "Default OG Description",
      images: [
        { url: "/default-og-image.jpg", width: 1200, height: 630 }
      ],
      url: "https://www.mautskebeli.ge",
      type: "website",
    },
    additionalMetaTags: [
      { property: 'fb:app_id', content: '1819807585106457' }
    ],
  };

  const finalMetadata = metadata || defaultMetadata;

  console.log("Rendering metadata in Head:", finalMetadata);

  return (
    <html lang="en">
      <Head>
        <title>{finalMetadata.title}</title>
        <meta name="description" content={finalMetadata.description} />
        {finalMetadata.additionalMetaTags.map(tag => (
          <meta key={tag.property} property={tag.property} content={tag.content} />
        ))}
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
