import Link from "next/link";
import VideoThumb from "./VideoThumb";

// Real per-episode thumbnails need the YouTube API (no key available in this build
// pass) — using the actual podcast brand art that already exists in the codebase
// (public/images/podcast.png) instead of a flat text box. Same video-style
// treatment as everything else here: this is your own produced show, not found
// photojournalism, so the duotone identity applies the same way it does to video.
const STRANDS = [
  { label: "პოდკასტი", href: "/podcast", image: "/images/podcast.png" },
  { label: "აზერბაიჯანული პოდკასტი", href: "/podcast", image: "/images/podcast.png" },
];

export default function PodcastRow() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <p className="mb-3 font-firago text-xs font-bold tracking-wide text-mau-violet">პოდკასტი</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {STRANDS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group block border border-mau-line-strong bg-mau-surface p-3 transition-colors hover:border-mau-violet"
          >
            <VideoThumb src={s.image} alt={s.label} sizes="(max-width: 768px) 100vw, 50vw" />
            <h3 className="mt-3 font-firago text-base font-bold text-mau-ink">
              {s.label}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
