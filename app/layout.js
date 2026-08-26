// app/layout.js - Root Layout for entire application

import "../style/globals.css";
import { Noto_Sans_Georgian } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import AnalyticsPageView from "./components/AnalyticsPageView";
import { LanguageProvider } from "./context/LanguageContext";

// ──────────────────────────
//  Metadata (title, OG, etc.)
// ──────────────────────────
export const metadata = {
  title:       "მაუწყებელი",
  description: "მედია პლატფორმა მაუწყებელი",
  app_id:      "1819807585106457",

  openGraph: {
    title:       "მაუწყებელი",
    description: "მედია პლატფორმა მაუწყებელი",
    url:         "https://www.mautskebeli.ge/",       
    siteName:    "მაუწყებელი",
    locale:      "ka_GE",
    type:        "website",
    images: [{ url: "/images/logo.png", width: 1200, height: 630 }]
  },

  twitter: {
    card:        "summary_large_image",
    title:       "მაუწყებელი",
    description: "მედია პლატფორმა მაუწყებელი",
    images: ["/images/logo.png"]
  }
};

// ──────────────────────────
//  Google Font
// ──────────────────────────
const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: [
    "100", "200", "300", "400", "500",
    "600", "700", "800", "900"
  ],
  display: "swap",
  variable: "--font-noto-sans-georgian"
});

// FiraGO — homepage redesign only, self-hosted (SIL OFL licensed, see app/fonts/OFL.txt).
// Kept separate from notoSansGeorgian above so untouched pages (translate, sport-articles, etc.)
// keep rendering with their existing font until they're redesigned too.
const firaGO = localFont({
  src: [
    { path: "./fonts/FiraGO-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FiraGO-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/FiraGO-Heavy.woff2", weight: "900", style: "normal" }
  ],
  display: "swap",
  variable: "--font-firago"
});

// ──────────────────────────
//  Root Layout
// ──────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="ka" className={`${notoSansGeorgian.variable} ${firaGO.variable}`}>
      <head>
        {/* Google Analytics - G-C2ZPMYP4FY - Placed in <head> for Search Console verification */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="beforeInteractive"
        />
        <Script
          id="ga-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C2ZPMYP4FY', { send_page_view: false });
            `
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          {/* SPA route-change tracker */}
          <AnalyticsPageView />
        </LanguageProvider>
      </body>
    </html>
  );
}
