import FacebookNews from "../components/FacebookNews";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";
import MainNews from "../components/MainNews";
import Navigation from "../components/Navigation";
import Sidebar from "../components/Sidebar";
import { MenuProvider } from "../context/MenuContext";
import Head from 'next/head';

const metadata = {
  title: "mautskebeli.ge",
  description: "მედია პლათფორმა მაუწყებელი",
  image: "https://mautskebeli.ge/static/images/og-logo.jpg",
  url: "https://www.mautskebeli.ge/"
};

export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen">
        <Head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
          <meta property="og:title" content={metadata.title} />
          <meta property="og:description" content={metadata.description} />
          <meta property="og:image" content={metadata.image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content={metadata.url} />
        </Head>
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        <div className="mx-auto mt-[24px] flex flex-col md:flex-row gap-5 w-11/12 md:w-10/12">
          <Sidebar />
          <MainNews />
        </div>
        <FacebookNews />
        <HomePageVideos />
        <HomePageStatiebi />
        <HomePagePodcast />
        <HomePageRcheuli />
        <Footer />
      </main>
    </MenuProvider>
  );
}
