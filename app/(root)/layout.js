import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from "next/head";
import Script from "next/script";

export const metadata = {
  title: "მაუწყებელი",
  description: "მედია პლათფორმა მაუწყებელი",
  app_id: "1819807585106457",
};

export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      
      <body>
        {/* Your actual content goes here */}
        {children}

        {/* Google Analytics script moved inside the <body> */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MZY3EGWH6J"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MZY3EGWH6J');
            `,
          }}
        />
      </body>
    </html>
  );
}