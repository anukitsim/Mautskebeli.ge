import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import { fetchArticleTitle } from "../../utils/fetchArticleTitle";

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
  let description = 'მედია პლათფორმა მაუწყებელი';
  let images = [
    {
      url: 'https://www.mautskebeli.ge/og-bg.svg',
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
      url: `https://www.mautskebeli.ge/all-articles/${articleId}`,
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
