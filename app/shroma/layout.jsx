import React from "react";
import Head from "next/head";
import Footer from "../components/Footer";
import "../../style/globals.css"
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

export default function RootLayout({ children, pageMeta }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
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
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-shroma"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C2ZPMYP4FY', { send_page_view: false });
            `
          }}
        />
        <AnalyticsPageView />
      </body>
    </html>
  );
}
