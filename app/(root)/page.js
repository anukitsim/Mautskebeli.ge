import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";
import MainNews from "../components/MainNews";
import Navigation from "../components/Navigation";
import Sidebar from "../components/Sidebar";
// import HeroSideCards from "../components/HeroSideCards";
import NewsSection from "../components/NewsSection";
import { MenuProvider } from "../context/MenuContext";
import DonationPopup from "../components/DonationPopup";
import DonationBanner from "../components/DonationBanner";

export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen">
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>

        {/* Hero Section */}
        <div className="mx-auto mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-0 w-full sm:w-11/12 md:w-10/12">
          <div className="flex flex-row gap-5 items-stretch lg:min-h-[420px]">
            <Sidebar />
            <MainNews />
          </div>
        </div>

        {/* Hero Bento Section (commented out - side cards next to main banner) */}
        {/* <div className="mx-auto mt-8 w-11/12 md:w-10/12">
          <div className="hero-bento-layout">
            <div className="hero-bento-banner">
              <MainNews />
            </div>
            <div className="hero-bento-cards">
              <HeroSideCards />
            </div>
          </div>
        </div> */}

        {/* News Section */}
        <section className="mt-8 sm:mt-12 lg:mt-16 px-4 sm:px-0 sm:w-11/12 md:w-10/12 mx-auto">
          <NewsSection />
        </section>

        <div className="mx-auto px-4 sm:px-0 sm:w-11/12 md:w-10/12">
          <DonationPopup />

          <section className="mt-8 sm:mt-12 lg:mt-16">
            <HomePageVideos />
          </section>

          <section className="mt-8 sm:mt-12 lg:mt-16">
            <HomePageStatiebi />
          </section>
        </div>

        {/* Podcast Section - full width */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <HomePagePodcast />
        </div>

        <div className="mx-auto px-4 sm:px-0 sm:w-11/12 md:w-10/12">
          <section className="mt-8 sm:mt-12 lg:mt-16">
            <HomePageRcheuli />
          </section>
        </div>

        {/* Donation Banner - full width */}
        <section className="mt-8 sm:mt-12 lg:mt-16 w-full">
          <DonationBanner />
        </section>

        <Footer />
      </main>
    </MenuProvider>
  );
}
