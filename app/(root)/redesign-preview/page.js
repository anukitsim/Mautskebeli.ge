// Work-in-progress preview of the 2026 homepage redesign.
// Lives at /redesign-preview so it can be reviewed on localhost without touching
// the real homepage (app/(root)/page.js) until the whole thing is ready to swap in.
import Masthead from "../../components/homepage-2026/Masthead";
import TextZone from "../../components/homepage-2026/TextZone";
import VideoShelf from "../../components/homepage-2026/VideoShelf";
import PodcastRow from "../../components/homepage-2026/PodcastRow";
import RecommendsShelf from "../../components/homepage-2026/RecommendsShelf";
import Reveal from "../../components/homepage-2026/Reveal";
import DonationPopup from "../../components/homepage-2026/DonationPopup";

export default function RedesignPreview() {
  return (
    <main className="min-h-screen bg-mau-paper font-firago">
      <Masthead />
      <TextZone />
      <Reveal>
        <VideoShelf />
      </Reveal>
      <Reveal>
        <PodcastRow />
      </Reveal>
      <Reveal>
        <RecommendsShelf />
      </Reveal>
      <div className="h-16" />
      <DonationPopup />
    </main>
  );
}
