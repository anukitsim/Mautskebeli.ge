import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Navigation />
    </main>
  );
}
