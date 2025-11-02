import '../../style/globals.css'

import { MenuProvider } from "@/app/context/MenuContext";

import SportHeader from '../components/SportHeader';
import SportNavigation from '../components/SportNavigation';
import SportFooter from '../components/SportFooter';
import Head from 'next/head';
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

export const metadata = {
  title: "mautskebeli.ge",
  description: "მედია პლატფორმა მაუწყებელი",
  ogImage: "https://mautskebeli.ge/api/og?title=Default%20Title",
  metadataBase: new URL('https://www.mautskebeli.ge'), 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body className='bg-[#AD88C6]'>
      <MenuProvider>
          <div className="sticky top-0 z-50">
           <SportHeader />
            <SportNavigation />
          </div>
        </MenuProvider>
        {children}
        <div className="mt-40 bg-[#AD88C6]">
        <SportFooter />
        </div>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-sport-articles"
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
        <AnalyticsPageView />
      </body>
    </html>
  );
}