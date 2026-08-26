import Link from "next/link";
import { getTextZoneData } from "./lib";
import CardImage from "./CardImage";

function LeadCard({ item }) {
  return (
    <Link href={item.href} className="group block border border-mau-line-strong bg-mau-surface p-3 transition-colors hover:border-mau-violet">
      <CardImage src={item.image} alt={item.title} priority sizes="(max-width: 768px) 100vw, 66vw" />
      <span className="mt-3 inline-block border border-mau-violet px-2 py-0.5 font-firago text-[11px] tracking-wide text-mau-violet">
        {item.kind}
      </span>
      <h1 className="mt-2 font-firago text-2xl font-black leading-tight text-mau-ink sm:text-[32px]">
        {item.title}
      </h1>
      {item.dek && (
        <p className="mt-2 font-firago text-base leading-snug text-mau-ink-soft">
          {item.dek}
        </p>
      )}
      <div className="mt-3 flex justify-end border-t border-mau-line pt-3 font-mono text-xs text-mau-ink-soft">
        {item.dateLabel}
      </div>
    </Link>
  );
}

function SecondaryCard({ item }) {
  return (
    <Link href={item.href} className="group block border border-mau-line-strong bg-mau-surface p-3 transition-colors hover:border-mau-violet">
      <CardImage src={item.image} alt={item.title} sizes="(max-width: 768px) 50vw, 33vw" />
      <span className="mt-3 inline-block border border-mau-violet px-2 py-0.5 font-firago text-[11px] tracking-wide text-mau-violet">
        {item.kind}
      </span>
      <h2 className="mt-2 font-firago text-base font-bold leading-snug text-mau-ink">
        {item.title}
      </h2>
      <div className="mt-3 flex items-baseline justify-between border-t border-mau-line pt-3 text-xs">
        {item.byline ? (
          <span className="font-firago font-bold text-mau-ink-soft">{item.byline}</span>
        ) : (
          <span />
        )}
        <span className="font-mono text-mau-ink-soft">{item.dateLabel}</span>
      </div>
    </Link>
  );
}

function RailRow({ item }) {
  return (
    <Link
      href={item.href}
      className="flex items-baseline justify-between gap-3 border-t border-mau-line py-3 font-firago text-sm font-semibold text-mau-ink-soft transition-colors first:border-none first:pt-0 hover:text-mau-violet"
    >
      <span className="line-clamp-2">{item.title}</span>
      <span className="shrink-0 font-mono text-xs">{item.dateLabel}</span>
    </Link>
  );
}

export default async function TextZone() {
  const { lead, secondary, rail } = await getTextZoneData();

  if (!lead) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <LeadCard item={lead} />
          <div className="grid gap-6 sm:grid-cols-2">
            {secondary.map((item) => (
              <SecondaryCard key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        </div>

        <aside className="border border-mau-line-strong bg-mau-surface p-4">
          <Link
            href="/news"
            className="group mb-3 flex items-center justify-between font-firago text-xs font-bold tracking-wide text-mau-ink transition-colors hover:text-mau-violet"
          >
            ბოლო ამბები
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          {rail.map((item) => (
            <RailRow key={item.id} item={item} />
          ))}
        </aside>
      </div>
    </section>
  );
}
