import { localizeMetadata } from '@/utils/i18n/metadata';
import "../../style/globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "../components/Footer";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

const metadataKa = {
  title: "ქალაქი - მაუწყებელი",
  description: "ქალაქის სიახლეები და ამბები",
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      {children}
      <Footer />

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
        strategy="afterInteractive"
      />
      <Script
        id="ga-init-kalaki"
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
    </LanguageProvider>
  );
}

