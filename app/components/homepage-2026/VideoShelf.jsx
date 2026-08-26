import Link from "next/link";
import VideoThumb from "./VideoThumb";
import { getVideoShelfData, getWorldData } from "./lib";

function VideoCard({ item }) {
  return (
    <Link href={item.href} className="group block border border-mau-line-strong bg-mau-surface p-3 transition-colors hover:border-mau-violet">
      <VideoThumb src={item.image} alt={item.title} sizes="(max-width: 768px) 50vw, 25vw" />
      <span className="mt-3 inline-block border border-mau-violet px-2 py-0.5 font-firago text-[11px] text-mau-violet">
        {item.kind}
      </span>
      <h3 className="mt-2 font-firago text-sm font-bold leading-snug text-mau-ink">
        {item.title}
      </h3>
      <div className="mt-2 flex justify-end border-t border-mau-line pt-2 font-mono text-xs text-mau-ink-soft">
        {item.dateLabel}
      </div>
    </Link>
  );
}

export default async function VideoShelf() {
  const [{ chips, shelf }, world] = await Promise.all([
    getVideoShelfData(),
    getWorldData(),
  ]);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-4 flex flex-wrap gap-2">
        {chips.map((label) => (
          <span key={label} className="border border-mau-line-strong px-2.5 py-1 font-firago text-xs font-semibold text-mau-ink-soft">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {shelf.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>

      {world.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 font-firago text-xs font-bold tracking-wide text-mau-violet">მსოფლიო</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {world.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
