import { localizeMetadata } from '@/utils/i18n/metadata';
import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

const metadataKa = {
  title: "პოდკასტი - მაუწყებელი",
  description: "მაუწყებლის პოდკასტები",
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

export default function PodcastLayout({ children }) {
  return (
    <>
      <MenuProvider>
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        {children}
        <Footer />
      </MenuProvider>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
        strategy="afterInteractive"
      />
      <Script
        id="ga-init-podcast"
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
    </>
  );
}

