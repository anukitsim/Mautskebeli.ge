import Link from "next/link";
import Image from "next/image";
import { getRecommendsData } from "./lib";

const HREF_BASE = {
  article: "/all-articles",
  "free-column": "/free-column",
  targmani: "/translate",
};

// Deliberately lower-tier than everything above it (client call: low priority, not
// unimportant) — but "quiet" and "illegibly tiny" aren't the same thing. Legible
// thumbnails and real spacing, still no violet chip/border treatment so it reads
// as the closer, not another headline section.
export default async function RecommendsShelf() {
  const items = await getRecommendsData();
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <p className="mb-4 font-firago text-sm font-bold text-mau-ink-soft">
        მაუწყებელი გირჩევთ
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${HREF_BASE[item.kind] || "/all-articles"}/${item.id}`}
            className="group block"
          >
            {item.image && (
              <span className="relative block aspect-video w-full overflow-hidden bg-mau-surface">
                <Image src={item.image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </span>
            )}
            <span className="mt-2 block line-clamp-2 font-firago text-[13px] leading-snug text-mau-ink-soft transition-colors group-hover:text-mau-violet">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
