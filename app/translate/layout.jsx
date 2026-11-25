import { localizeMetadata } from '@/utils/i18n/metadata';
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";

const metadataKa = {
  title: "Mautskebeli Translate",
  description: "Explore analytical translations on Mautskebeli.",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: "https://www.mautskebeli.ge/translate",
    siteName: "Mautskebeli",
  },
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

// The <html>, <body>, Google Analytics and LanguageProvider come from
// app/layout.js. A section layout must not add them again: a second
// <html> inside <body> breaks hydration, and a second AnalyticsPageView
// counts every visit twice.
export default function TranslateLayout({ children }) {
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
