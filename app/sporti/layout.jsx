import '../../style/globals.css'
import '../../node_modules/alk-tall-mtavruli/css/alk-tall-mtavruli.css';
import { Noto_Sans_Georgian } from 'next/font/google';
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';
import { LanguageProvider } from "../context/LanguageContext";

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  display: 'swap',
  variable: '--font-noto-sans-georgian',
});

export const metadata = {
  title: 'სპორტი',
  description: 'მაუწყებელი სპორტი, სტატიები და ვიდეოები',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={notoSansGeorgian.variable}>
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#AD88C6]">
        <LanguageProvider>
        {children}
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
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
              gtag('config', 'G-C2ZPMYP4FY', { send_page_view: false });
            `
          }}
        />
        <AnalyticsPageView />
      
        </LanguageProvider>
      </body>
    </html>
  );
}
  