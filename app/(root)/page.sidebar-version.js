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
      <main className="min-h-screen">
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>

        {/* Hero Section: Main News Banner + News Cards Side by Side */}
        <div className="mx-auto mt-8 flex flex-col lg:flex-row gap-5 w-11/12 md:w-10/12 lg:mb-0 mb-[280px]">
          {/* Left: News Cards Section */}
          <div className="hidden lg:block lg:w-3/12">
            <NewsSection />
          </div>
          
          {/* Right: Main News Big Banner */}
          <div className="lg:w-9/12 w-full lg:h-[500px] h-auto">
            <MainNews />
          </div>
        </div>

        <div className="container mx-auto">
          <DonationPopup />

          {/* Mobile: News Section (shown below banner on mobile) */}
          <section className="lg:hidden px-4 mt-24 lg:mt-32">
            <NewsSection />
          </section>

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
