// app/(root)/layout.jsx

import '../../style/globals.css';
import { Noto_Sans_Georgian } from 'next/font/google';
import Head from 'next/head';
import Script from 'next/script';

export const metadata = {
  title: 'მაუწყებელი',
  description: 'მედია პლათფორმა მაუწყებელი',
  app_id: '1819807585106457',
};

// Import and configure your Google font
const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-noto-sans-georgian',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${notoSansGeorgian.variable}`}>
      <head>
        {/* Include any additional <head> elements if necessary */}
      </head>
      <body>
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
