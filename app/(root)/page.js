import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";
import MainNews from "../components/MainNews";
import Navigation from "../components/Navigation";
import Sidebar from "../components/Sidebar";
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

        {/* Main News Section - Hero Banner with Sidebar (same width as sections below) */}
        <div className="mx-auto mt-8 flex flex-col md:flex-row gap-5 w-11/12 md:w-10/12 lg:mb-0 mb-[280px] items-stretch">
          <Sidebar />
          <MainNews />
        </div>

        {/* News Section - ახალი ამბები */}
        {/* <section className="container mx-auto px-4 lg:px-8 mt-24 lg:mt-32">
          <NewsSection />
        </section> */}

        {/* Sections: same width as hero (w-11/12 md:w-10/12), podcast stays full width below */}
        <div className="mx-auto w-11/12 md:w-10/12">
          <DonationPopup />

          {/* Home Page Videos Section */}
          <section className="px-0 mt-12 lg:mt-16">
            <HomePageVideos />
          </section>

          {/* Home Page Statiebi Section */}
          <section className="px-0 mt-12 lg:mt-16">
            <HomePageStatiebi />
          </section>
        </div>

        {/* Home Page Podcast Section - full width, do not change */}
        <div className="mt-12 lg:mt-16">
          <HomePagePodcast />
        </div>

        <div className="mx-auto w-11/12 md:w-10/12">
          {/* Home Page Rcheuli Section */}
          <section className="px-0 mt-12 lg:mt-16">
            <HomePageRcheuli />
          </section>

          {/* Donation Banner */}
          {/* <section className="px-4 lg:px-8 mt-12 lg:mt-16">
            <DonationBanner />
          </section> */}
        </div>

        <Footer />
      </main>
    </MenuProvider>
  );
}
