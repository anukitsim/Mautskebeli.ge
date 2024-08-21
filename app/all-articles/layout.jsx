import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>Default Title</title>
        <meta name="description" content="Default description" />
        <meta property="fb:app_id" content="1819807585106457" />
        <meta property="og:title" content="Default OG Title" />
        <meta property="og:description" content="Default OG Description" />
        <meta property="og:image" content="/default-og-image.jpg" />
        <meta property="og:url" content="https://www.mautskebeli.ge" />
        <meta property="og:type" content="website" />
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
