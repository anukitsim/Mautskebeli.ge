import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';
import Script from 'next/script'; // Import Next.js Script component

export const metadata = {
  title: "მაუწყებელი",
  description: "მედია პლათფორმა მაუწყებელი",
  app_id: "1819807585106457"
};

export default function RootLayout({ children }) {
  const defaultOgImage = 'https://mautskebeli.ge/api/og?title=Default%20Title';

  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={defaultOgImage} />
        <meta property="fb:app_id" content="1819807585106457" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-MZY3EGWH6J`}  // Replace with your Measurement ID
          strategy="beforeInteractive" // Load before the page becomes interactive
        />
        <Script
          id="ga-init"
          strategy="beforeInteractive" // Load before the page becomes interactive
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MZY3EGWH6J');  // Replace with your Measurement ID
            `,
          }}
        />
      </Head>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
