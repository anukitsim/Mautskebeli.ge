import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export const metadata = {
  title: "მაუწყებელი",
  description: "მედია პლათფორმა მაუწყებელი, სტატიები, თარგმანი, მაუწყებელი წიგნები, თავისუფალი სვეტი",
  ogImage: "https://mautskebeli.ge/api/og?title=Default%20Title",
  metadataBase: new URL('https://www.mautskebeli.ge'), 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={metadata.title} />
        <meta property="fb:app_id" content="1819807585106457" />
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
