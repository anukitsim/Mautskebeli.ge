import Link from "next/link";
import Image from "next/image";

const NAV = [
  { label: "მთავარი", href: "/" },
  { label: "ამბები", href: "/news" },
  { label: "ტექსტი", href: "/all-articles" },
  { label: "პოდკასტი", href: "/podcast" },
  { label: "სპორტი", href: "/sporti" },
];

// Donate CTA is back, always present, no show/hide coordination with anything else —
// client explicitly didn't want the fade-in/out behavior from an earlier round.
// It's fine if this and DonationModule are both visible at once while scrolling
// past that section; that's an accepted tradeoff now, not an oversight.
export default function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-mau-line bg-mau-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center gap-8 px-6 py-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo-2026.svg"
            alt="მაუწყებელი"
            width={140}
            height={39}
            className="h-[32px] w-auto"
            priority
          />
        </Link>

        <nav className="hidden flex-wrap gap-6 font-firago text-sm font-semibold text-mau-ink-soft sm:flex">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-mau-violet ${
                i === 0 ? "text-mau-ink" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <Link
            href="/search"
            aria-label="ძიება"
            className="text-mau-ink-soft transition-colors hover:text-mau-violet"
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11.2 11.2 15.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/donation"
            className="shrink-0 bg-mau-acid px-5 py-2.5 font-firago text-sm font-bold text-[#1A0E24] transition-transform hover:scale-105"
          >
            გააძლიერე მაუწყებელი
          </Link>
        </div>
      </div>
    </header>
  );
}
