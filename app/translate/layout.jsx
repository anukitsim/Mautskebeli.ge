"use client";
import "../../style/globals.css";
import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Footer from "../components/Footer";


// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
      <MenuProvider>
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        </MenuProvider>
      
          {children}
        <Footer />
      </body>
    </html>
  );
}
