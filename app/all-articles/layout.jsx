import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";
import { fetchArticleTitle } from "../../utils/fetchArticleTitle";

// Generate Open Graph metadata for the article
export async function generateMetadata({ params }) {
  const articleId = params.id;  // Use params.id to get the article ID
  let title = 'მაუწყებელი';
  let description = 'მედია პლათფორმა მაუწყებელი';
  let images = [
    {
      url: 'https://www.mautskebeli.ge/og-bg.png',
      width: 800,
      height: 600,
    },
  ];

  if (articleId) {
    title = await fetchArticleTitle(articleId);
    images = [
      {
        url: `https://www.mautskebeli.ge/api/og?title=${encodeURIComponent(title)}`,
        width: 800,
        height: 600,
      },
    ];
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
