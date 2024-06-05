'use client';

import "../../style/globals.css";
import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Footer from "../components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
