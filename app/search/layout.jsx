"use client";

import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Footer from "../components/Footer";

export default function SearchLayout({ children }) {
  return (
    <>
      <MenuProvider>
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
      </MenuProvider>
      {children}
      <Footer />
    </>
  );
}
