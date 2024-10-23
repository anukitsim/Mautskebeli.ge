"use client";
import "../../style/globals.css";
import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { MenuProvider } from "../context/MenuContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
          <div className="pt-20"> {/* Adjust padding as needed */}
            {children}
          </div>
        </MenuProvider>
      </body>
    </html>
  );
}
