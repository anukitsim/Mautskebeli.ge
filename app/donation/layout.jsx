// app/layout.jsx

'use client';

import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { MenuProvider } from "../context/MenuContext";
import { PayPalProvider } from "../context/PayPalContext";

// The <html>, <body>, Google Analytics and LanguageProvider come from
// app/layout.js. A section layout must not add them again: a second
// <html> inside <body> breaks hydration, and a second AnalyticsPageView
// counts every visit twice.
export default function DonationLayout({ children }) {
  return (
    <PayPalProvider>
      <MenuProvider>
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        {children}
      </MenuProvider>
    </PayPalProvider>
  );
}
