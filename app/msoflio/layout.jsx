import "../../style/globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "../components/Footer";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

export const metadata = {
  title: "მსოფლიო - მაუწყებელი",
  description: "მსოფლიოს სიახლეები და ამბები",
};

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
        id="ga-init-msoflio"
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

