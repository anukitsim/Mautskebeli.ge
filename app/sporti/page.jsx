import SportHeader from "../components/SportHeader";

import SportNavigation from "../components/SportNavigation";
import SportMain from "../components/SportMain";
import { MenuProvider } from "../context/MenuContext";
import SportHomePageVideos from "../components/SportHomePageVideos";
import SportFooter from "../components/SportFooter";

export default function Home() {
  return (
    <MenuProvider>
      <main className="min-h-screen bg-[#AD88C6]">
        <div className="sticky top-0 z-50">
          <SportHeader />
          <SportNavigation />
        </div>
        <SportHomePageVideos />

        <SportFooter />
      </main>
    </MenuProvider>
  );
}
