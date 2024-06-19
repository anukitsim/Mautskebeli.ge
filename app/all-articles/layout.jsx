import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import Head from 'next/head';

async function fetchArticleDetails(articleId) {
  const res = await fetch(`https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/article/${articleId}?acf_format=standard&_fields=id,title,acf,date`);
  if (!res.ok) {
    throw new Error('Failed to fetch article');
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const articleId = params.id;
  let title = 'მაუწყებელი';
  let description = 'მედია პლათფორმა მაუწყებელი';
  let imageUrl = 'https://www.mautskebeli.ge/images/og-logo.jpg';
  let articleUrl = `https://www.mautskebeli.ge/all-articles/${articleId}`;

  if (articleId) {
    try {
      const article = await fetchArticleDetails(articleId);
      title = article.title.rendered || title;
      description = article.acf.title || description;
      if (article.acf.image) {
        imageUrl = article.acf.image;
      }
      console.log('Generated Metadata:', { title, description, imageUrl, articleUrl });
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
      url: articleUrl,
      siteName: 'მაუწყებელი',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
  };
}

export default function RootLayout({ children, metadata }) {
  const { title, description, openGraph } = metadata || {};
  const defaultImage = 'https://www.mautskebeli.ge/images/og-logo.jpg';
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  return (
    <html lang="en">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {openGraph && (
          <>
            <meta property="og:title" content={openGraph.title} />
            <meta property="og:description" content={openGraph.description} />
            <meta property="og:url" content={openGraph.url} />
            <meta property="og:site_name" content={openGraph.siteName} />
            <meta property="og:locale" content={openGraph.locale} />
            <meta property="og:image" content={openGraph.images[0].url || defaultImage} />
            <meta property="og:image:width" content={openGraph.images[0].width || 800} />
            <meta property="og:image:height" content={openGraph.images[0].height || 600} />
            <meta property="og:type" content={openGraph.type} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={openGraph.title} />
            <meta name="twitter:description" content={openGraph.description} />
            <meta name="twitter:image" content={openGraph.images[0].url || defaultImage} />
            <meta name="twitter:image:width" content={openGraph.images[0].width || 800} />
            <meta name="twitter:image:height" content={openGraph.images[0].height || 600} />
            {fbAppId && <meta property="fb:app_id" content={fbAppId} />}
          </>
        )}
      </Head>
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
      </body>
    </html>
  );
}
