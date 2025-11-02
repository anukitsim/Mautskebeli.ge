// app/(root)/layout.jsx

import "../../style/globals.css";
import { Noto_Sans_Georgian } from "next/font/google";
import Script from "next/script";
import AnalyticsPageView from "../components/AnalyticsPageView";

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

// ──────────────────────────
//  Root Layout
// ──────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="ka" className={notoSansGeorgian.variable}>
      <body>
        {children}

        {/* Google Analytics - G-C2ZPMYP4FY */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />

        {/* GA init (send_page_view disabled; handled by AnalyticsPageView) */}
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C2ZPMYP4FY', { send_page_view: false });
            `
          }}
        />

        {/* SPA route-change tracker */}
        <AnalyticsPageView />
      </body>
    </html>
  );
}
