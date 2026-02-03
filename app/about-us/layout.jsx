import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Footer from "../components/Footer";

export const metadata = {
  title: "ჩვენს შესახებ | მაუწყებელი",
  description: "მაუწყებელი — დამოუკიდებელი ონლაინ მედია პლატფორმა",
};

export default function AboutUsLayout({ children }) {
  return (
    <MenuProvider>
      <div className="sticky top-0 z-50">
        <Header />
        <Navigation />
      </div>
      {children}
      <Footer />
    </MenuProvider>
  );
}
