// app/layout.jsx

'use client';

import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { MenuProvider } from "../context/MenuContext";
import { PayPalProvider } from "../context/PayPalContext";

import "../../style/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PayPalProvider>
          <MenuProvider>
            <div className="sticky top-0 z-50">
              <Header />
              <Navigation />
            </div>
            {children}
          </MenuProvider>
        </PayPalProvider>
      </body>
    </html>
  );
}
