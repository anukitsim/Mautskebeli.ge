import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export const metadata = {
  title: "mautskebeli.ge",
  description: "მედია პლათფორმა მაუწყებელი",
  ogImage: "https://mautskebeli.ge/api/og?title=Default%20Title",
  metadataBase: new URL('https://www.mautskebeli.ge'), // Set your base URL 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:url" content={metadata.metadataBase} />
      </Head>
      <body>
        <MenuProvider>
          <Header />
          <Navigation />
          {children}
          <Footer />
        </MenuProvider>
      </body>
    </html>
  );
}
