import "../../style/globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { MenuProvider } from "@/app/context/MenuContext";
import Footer from "../components/Footer";

export const metadata = {
  title: "Mautskebeli - Books",
  description: "Explore a collection of books available on Mautskebeli.",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: "https://www.mautskebeli.ge/books",
    siteName: "Mautskebeli",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MenuProvider>
          <div className="sticky top-0 z-50">
            <Header />
            <Navigation />
          </div>
          {children}
          <Footer />
        </MenuProvider>
      </body>
    </html>
  );
}
