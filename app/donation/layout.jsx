// app/layout.jsx

'use client';

import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { MenuProvider } from "../context/MenuContext";
import { LanguageProvider } from "../context/LanguageContext";
import { PayPalProvider } from "../context/PayPalContext";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

import "../../style/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body>
        <LanguageProvider>
        <PayPalProvider>
          <MenuProvider>
            <div className="sticky top-0 z-50">
              <Header />
              <Navigation />
            </div>
            {children}
          </MenuProvider>
        </PayPalProvider>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-donation"
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
