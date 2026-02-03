import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";
import MainNews from "../components/MainNews";
import Navigation from "../components/Navigation";
import NewsSection from "../components/NewsSection";
import { MenuProvider } from "../context/MenuContext";
import DonationPopup from "../components/DonationPopup";

export default function Home() {
  return (
    <MenuProvider>
      {/* Consistent soft lavender background throughout */}
      <main className="min-h-screen bg-[#F5F3FA]">
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>

        {/* Hero Section: Banner + Breaking News Sidebar */}
        <div className="mx-auto mt-8 w-11/12 md:w-10/12 lg:mb-0 mb-[280px]">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: Big Banner Carousel (70%) */}
            <div className="lg:w-[70%] w-full">
              <div className="rounded-[20px] shadow-[0_8px_40px_rgba(113,88,143,0.15)] overflow-hidden h-full">
                <MainNews />
              </div>
            </div>
            
            {/* Right: Breaking News Sidebar (30%) */}
            <div className="lg:w-[30%] w-full">
              <NewsSection />
            </div>
          </div>
        </div>

        <div className="container mx-auto">
          <DonationPopup />

          {/* Home Page Videos Section */}
          <section className="px-4 lg:px-8 mt-12 lg:mt-16">
            <HomePageVideos />
          </section>

          {/* Home Page Statiebi Section */}
          <section className="px-4 lg:px-8 mt-12 lg:mt-16">
            <HomePageStatiebi />
          </section>
        </div>

        {/* Home Page Podcast Section */}
        <div className="mt-12 lg:mt-16">
          <HomePagePodcast />
        </div>

        <div className="container mx-auto">
          {/* Home Page Rcheuli Section */}
          <section className="px-4 lg:px-8 mt-12 lg:mt-16">
            <HomePageRcheuli />
          </section>
        </div>

        <Footer />
      </main>
    </MenuProvider>
  );
}
