
import DonationPopup from "../components/DonationPopup";
import FacebookNews from "../components/FacebookNews";
import Footer from "../components/Footer";
import SportHeader from "../components/SportHeader";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";

import SportNavigation from "../components/SportNavigation";
import SportMain from "../components/SportMain";
import { MenuProvider } from "../context/MenuContext";



export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen bg-[#AD88C6]">
      <div className="sticky top-0 z-50">
         <SportHeader />
          <SportNavigation />
        </div>

        <div className="mx-auto mt-[24px]  w-11/12 md:w-10/12">
        <SportMain />
      
        </div>
        <FacebookNews />
        <HomePageVideos />
        <HomePageStatiebi />
        <HomePagePodcast />
        <HomePageRcheuli />
        <DonationPopup />
        <Footer />
      </main>

    </MenuProvider>
  );
}
