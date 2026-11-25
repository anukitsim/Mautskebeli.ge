import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";

// Share-preview tags for the single-video pages (they used to be hand-written
// <meta> tags inside a second <html><head>, which duplicated og:title and
// sent og:locale twice). Same texts and image, now through Next metadata.
export const metadata = {
  title: "მაუწყებელი",
  description: "მედია პლატფორმა მაუწყებელი",
  openGraph: {
    title: "მაუწყებელი",
    description: "მედია პლატფორმა მაუწყებელი",
    url: "https://www.mautskebeli.ge/",
    siteName: "მაუწყებელი",
    locale: "ka_GE",
    type: "article",
    images: [{ url: "https://www.mautskebeli.ge/images/og-logo.jpg", width: 800, height: 600 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "მაუწყებელი",
    description: "მედია პლატფორმა მაუწყებელი",
    images: ["https://www.mautskebeli.ge/images/og-logo.jpg"],
  },
};

// The <html>, <body>, Google Analytics and LanguageProvider come from
// app/layout.js. A section layout must not add them again: a second
// <html> inside <body> breaks hydration, and a second AnalyticsPageView
// counts every visit twice.
export default function VideoLayout({ children }) {
  return (
    <MenuProvider>
      <div className="sticky top-0 z-50">
        <Header />
        <Navigation />
      </div>
      {children}
      <div className="mt-40">
        <Footer />
      </div>
    </MenuProvider>
  );
}
