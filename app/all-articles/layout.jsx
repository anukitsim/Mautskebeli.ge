import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export default function RootLayout({ children, metadata }) {
  // Provide default values for metadata
  const defaultMetadata = {
    title: "Default Title",
    description: "Default description",
    openGraph: {
      title: "Default OG Title",
      description: "Default OG Description",
      images: [
        {
          url: "/default-og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
      url: "https://www.mautskebeli.ge",
      type: "website",
    },
    additionalMetaTags: [],
  };

  const finalMetadata = metadata || defaultMetadata;

  return (
    <html lang="en">
     <Head>
     {console.log(finalMetadata.additionalMetaTags)}  
      <title>{finalMetadata.title}</title>
      <meta name="description" content={finalMetadata.description} />
      <meta property="og:title" content={finalMetadata.openGraph.title} />
      <meta property="og:description" content={finalMetadata.openGraph.description} />
      <meta property="og:image" content={finalMetadata.openGraph.images[0].url} />
      <meta property="og:image:width" content={finalMetadata.openGraph.images[0].width} />
      <meta property="og:image:height" content={finalMetadata.openGraph.images[0].height} />
      <meta property="og:url" content={finalMetadata.openGraph.url} />
      <meta property="og:type" content={finalMetadata.openGraph.type} />
      {finalMetadata.additionalMetaTags?.map(tag => (
        <meta key={tag.property} property={tag.property} content={tag.content} />
      ))}
      <link rel="icon" href="/favicon.ico" />
    </Head>

      <body>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
          {children}
          <div className="mt-40">
            <Footer />
          </div>
        </MenuProvider>
      </body>
    </html>
  );
}
