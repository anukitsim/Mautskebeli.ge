import SportHeader from "../components/SportHeader";
import SportNavigation from "../components/SportNavigation";
import { MenuProvider } from "../context/MenuContext";
import SportHomePageVideos from "../components/SportHomePageVideos";
import SportFooter from "../components/SportFooter";
import SportsArticles from "../components/SportsArticles";

export default function SportPage() {
  return (
    <MenuProvider>
      <main className="min-h-screen bg-[#AD88C6]">
        <div className="sticky top-0 z-50 shadow-lg">
          <SportHeader />
          <SportNavigation />
        </div>
        <div className="mx-auto w-full relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} aria-hidden />
          <div className="relative z-10">
            <SportHomePageVideos />
            <SportsArticles />
          </div>
        </div>
        <SportFooter />
      </main>
    </MenuProvider>
  );
}
