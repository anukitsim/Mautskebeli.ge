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
      { property: 'fb:app_id', content: '1819807585106457' },
      { property: 'og:site_name', content: 'Mautskebeli' },
      { property: 'og:locale', content: 'ka_GE' }, // Ensure correct locale
      { property: 'article:publisher', content: '100041686795244' } // Example FB Page ID
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
        <meta property="og:url" content={finalMetadata.openGraph.url} />
        <meta property="og:type" content={finalMetadata.openGraph.type} />
        <meta property="og:title" content={finalMetadata.openGraph.title} />
        <meta property="og:description" content={finalMetadata.openGraph.description} />
        <meta property="og:image" content={finalMetadata.openGraph.images[0].url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
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