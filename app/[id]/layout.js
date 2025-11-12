"use client";
import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import { LanguageProvider } from "@/app/context/LanguageContext";
import Footer from "../components/Footer";
import { fetchArticleTitle } from "../../utils/fetchArticleTitle";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

// Note: generateMetadata removed - this is now a client component for LanguageProvider

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <head>
        {/* Ensure meta tags are explicitly set */}
        <meta property="og:title" content="მაუწყებელი" />
        <meta property="og:description" content="მედია პლატფორმა მაუწყებელი" />
        <meta property="og:url" content="https://www.mautskebeli.ge/" />
        <meta property="og:image" content="https://www.mautskebeli.ge/images/og-logo.jpg" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="მაუწყებელი" />
        {/* Ensure Twitter meta tags are set */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="მაუწყებელი" />
        <meta name="twitter:description" content="მედია პლატფორმა მაუწყებელი" />
        <meta name="twitter:image" content="https://www.mautskebeli.ge/images/og-logo.jpg" />
        <meta name="twitter:image:width" content="800" />
        <meta name="twitter:image:height" content="600" />
      
      <link rel="icon" href="/favicon.ico" />
     
      </head>
      <body>
        <LanguageProvider>
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
        </LanguageProvider>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-article-id"
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
