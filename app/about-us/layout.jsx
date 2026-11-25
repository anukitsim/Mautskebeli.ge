import { localizeMetadata } from '@/utils/i18n/metadata';
import React from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "../context/MenuContext";
import Footer from "../components/Footer";

const metadataKa = {
  title: "ჩვენს შესახებ | მაუწყებელი",
  description: "მაუწყებელი — დამოუკიდებელი ონლაინ მედია პლატფორმა",
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

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
