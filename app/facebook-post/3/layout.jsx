import "../../../style/globals.css";

import Header from "../../components/Header";
import Navigation from "../../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "მაუწყებელი • Mautskebeli",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
      <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
        </MenuProvider>
        {children}
        <div className="mt-40">
        <Footer />
        </div>
      </body>
    </html>
  );
}
