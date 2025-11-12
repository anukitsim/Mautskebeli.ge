import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import { fetchArticleTitle } from "../../utils/fetchArticleTitle";
import Script from 'next/script';
import AnalyticsPageView from '../components/AnalyticsPageView';

async function fetchArticleDetails(articleId) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${articleId}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const articleId = params.id; // Use params.id to get the article ID
  let title = 'მაუწყებელი';
  let description = 'მედია პლატფორმა მაუწყებელი';
  let images = [
    {
      url: 'https://www.mautskebeli.ge/images/og-logo.jpg', // Default image URL
      width: 800,
      height: 600,
    },
    
  ];

  if (articleId) {
    try {
      const article = await fetchArticleDetails(articleId);
      title = article.title.rendered || title;
      description = article.acf.title || description;
      if (article.acf.image) {
        images = [
          {
            url: article.acf.image,
            width: 800,
            height: 600,
          },
        ];
      }
    } catch (error) {
      console.error('Error fetching article details:', error);
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: articleId ? `https://www.mautskebeli.ge/all-articles/${articleId}` : 'https://www.mautskebeli.ge/',
      siteName: 'მაუწყებელი',
      images,
      locale: 'en_US',
      type: 'article',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Ensure meta tags are explicitly set */}
        <meta property="og:title" content="მაუწყებელი" />
        <meta property="og:description" content="მედია პლატფორმა მაუწყებელი" />
        <meta property="og:url" content="https://www.mautskebeli.ge/" />
        <meta property="og:image" content="https://www.mautskebeli.ge/images/og-logo.jpg" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="მაუწყებელი" />
        {/* Ensure Twitter meta tags are set */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="მაუწყებელი" />
        <meta name="twitter:description" content="მედია პლატფორმა მაუწყებელი" />
        <meta name="twitter:image" content="https://www.mautskebeli.ge/images/og-logo.jpg" />
        <meta name="twitter:image:width" content="800" />
        <meta name="twitter:image:height" content="600" />
      
      <link rel="icon" href="/favicon.ico" />
     
      </head>
      <body>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
        </MenuProvider>
        {children}
        <div className="mt-40">
          <Footer />
        </div>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2ZPMYP4FY"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init-article-id"
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
