import { MenuProvider } from "@/app/context/MenuContext";

import SportHeader from '../components/SportHeader';
import SportNavigation from '../components/SportNavigation';
import SportFooter from '../components/SportFooter';

export const metadata = {
  title: "mautskebeli.ge",
  description: "მედია პლატფორმა მაუწყებელი",
};

export default function SportArticlesLayout({ children }) {
  return (
    <div className="bg-[#AD88C6]">
      <MenuProvider>
        <div className="sticky top-0 z-50">
          <SportHeader />
          <SportNavigation />
        </div>
      </MenuProvider>
      {children}
      <div className="mt-40 bg-[#AD88C6]">
        <SportFooter />
      </div>
    </div>
  );
}
