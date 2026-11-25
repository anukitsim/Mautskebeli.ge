// app/free-column/layout.jsx

import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";

export const metadata = {
  title: "Mautskebeli - Free Columns",
  description: "Browse free columns on Mautskebeli.",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: "https://www.mautskebeli.ge",
    siteName: "Mautskebeli",
  },
};

// The <html>, <body>, Google Analytics and LanguageProvider come from
// app/layout.js. A section layout must not add them again: a second
// <html> inside <body> breaks hydration, and a second AnalyticsPageView
// counts every visit twice.
export default function FreeColumnLayout({ children }) {
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
