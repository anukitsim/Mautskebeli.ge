import DonationPopup from "../components/DonationPopup";
import FacebookNews from "../components/FacebookNews";
import Header from "../components/Header";
import HomePagePodcast from "../components/HomePagePodcast";
import HomePageRcheuli from "../components/HomePageRcheuli";
import HomePageStatiebi from "../components/HomePageStatiebi";
import HomePageVideos from "../components/HomePageVideos";
import MainNews from "../components/MainNews";
import Navigation from "../components/Navigation";
import Sidebar from "../components/Sidebar";
import { MenuProvider } from "../context/MenuContext";

export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen">
        <Header />
        <Navigation />

        <div className="mx-auto mt-[24px] flex flex-col md:flex-row gap-5 w-11/12 md:w-10/12">
          <Sidebar />
          <MainNews />
        </div>
        <FacebookNews />
        <HomePageVideos />
        <HomePageStatiebi />
        <HomePagePodcast />
        <HomePageRcheuli />
        <DonationPopup />
      </main>

    </MenuProvider>
  );
}
