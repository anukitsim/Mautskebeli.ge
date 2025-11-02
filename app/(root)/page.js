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
import DonationPopup from "../components/DonationPopup";

export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen">
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>

        <div className="mx-auto mt-[24px] flex flex-col md:flex-row gap-5 w-11/12 md:w-10/12">
          <Sidebar />
          <MainNews />
        </div>

        <div className="container mx-auto">
          <DonationPopup />

          {/* Home Page Videos Section */}
          <section className="px-4 lg:px-8 mt-10">
            <HomePageVideos />
          </section>

          {/* Home Page Statiebi Section */}
          <section className="px-4 lg:px-8 mt-10">
            <HomePageStatiebi />
          </section>
        </div>

       <div className="mt-10">
       <HomePagePodcast />
       </div>
        

        <div className="container mx-auto">
          {/* Home Page Rcheuli Section */}
          <section className="px-4 lg:px-8 mt-10">
            <HomePageRcheuli />
          </section>
        </div>

        <Footer />
      </main>
    </MenuProvider>
  );
}
