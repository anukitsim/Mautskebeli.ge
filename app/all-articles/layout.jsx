// app/all-articles/layout.jsx

import { localizeMetadata } from '@/utils/i18n/metadata';
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";

const metadataKa = {
  title: "სტატიები – მაუწყებელი",
  description: "მაუწყებელი – სტატიები.",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: "https://www.mautskebeli.ge/all-articles",
    siteName: "Mautskebeli",
  },
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

export default function AllArticlesLayout({ children }) {
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
