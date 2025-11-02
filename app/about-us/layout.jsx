
import "../../style/globals.css";
import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { MenuProvider } from "../context/MenuContext";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "../components/Footer";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

export const metadata = {
  title: "მაუწყებელი • Mautskebeli",
  description: "მაუწყებელი-ჩვენს შესახებ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <LanguageProvider>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
        </MenuProvider>

        {children}
        <Footer />
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-about-us"
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
      
        </LanguageProvider>
      </body>
    </html>
  );
}
