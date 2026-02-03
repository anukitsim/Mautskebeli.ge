// app/news/layout.jsx - Layout for news pages

import Header from "../components/Header";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { MenuProvider } from "../context/MenuContext";

export const metadata = {
  title: "ახალი ამბები | მაუწყებელი",
  description: "უახლესი ამბები და სიახლეები მაუწყებელისგან",
};

export default function NewsLayout({ children }) {
  return (
    <MenuProvider>
      <div className="min-h-screen flex flex-col bg-[#F6F4F8]">
        <div className="sticky top-0 z-50">
          <Header />
          <Navigation />
        </div>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </MenuProvider>
  );
}
