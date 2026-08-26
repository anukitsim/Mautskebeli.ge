import Link from "next/link";

// Real copy from the live DonationBanner.jsx, wording untouched (client rule: never
// change this text). Visual treatment matches the site's own card grammar (flat
// bordered surface + CSS grid) instead of a standalone gradient banner — the
// gradient/flex-wrap version read as a bolted-on ad unit next to the bordered,
// grid-based cards everywhere else on the page.
export default function DonationModule() {
  return (
    <section id="donation-module" className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="grid grid-cols-1 items-center gap-6 border border-mau-line-strong bg-mau-surface p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 h-11 w-1 shrink-0 bg-mau-violet" />
          <div>
            <p className="font-firago text-xl font-black leading-tight text-mau-ink sm:text-2xl">
              გააძლიერე მაუწყებელი
            </p>
            <p className="mt-1 font-firago text-sm text-mau-ink-soft">
              გააძლიერე წინააღმდეგობა!
            </p>
          </div>
        </div>
        <Link
          href="/donation"
          className="flex shrink-0 items-center justify-center border border-mau-acid px-6 py-3 font-firago text-sm font-bold text-mau-acid transition-colors hover:bg-mau-acid hover:text-[#1A0E24] sm:justify-self-end"
        >
          გააძლიერე მაუწყებელი
        </Link>
      </div>
    </section>
  );
}
