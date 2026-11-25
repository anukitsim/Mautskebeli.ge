// app/all-articles/[id]/ArticleLanguageSwitcher.jsx
//
// Row of language "pills" under the article image.
// Server component: plain links, so it works without JavaScript and
// search engines can follow them to the translated versions.

import Link from 'next/link';
import { ORIGINAL, TRANSLATIONS, postUrl } from './translations';

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z" />
    </svg>
  );
}

/**
 * @param slug          article slug (or id) used in the URL
 * @param current       ORIGINAL or one entry of TRANSLATIONS
 * @param published     translations that should be listed
 * @param basePath      /all-articles (default) or /free-column
 */
export default function ArticleLanguageSwitcher({ slug, current, published, basePath = '/all-articles' }) {
  // Keep the order from translations.js, and always include the page
  // the reader is on right now.
  const shown = [
    ORIGINAL,
    ...TRANSLATIONS.filter((t) => t === current || published.includes(t)),
  ];

  if (shown.length < 2) return null;

  return (
    <nav
      aria-label={current.ui.language}
      className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#AD88C6]/40 bg-[#AD88C6]/10 px-3 py-3 sm:px-4"
    >
      <span className="flex items-center gap-1.5 pr-1 text-sm font-semibold text-[#474F7A]">
        <GlobeIcon />
        {current.ui.language}
      </span>

      <ul className="flex flex-wrap gap-2">
        {shown.map((lang) => {
          const isCurrent = lang === current;
          return (
            <li key={lang.code}>
              <Link
                // ?lang=ka: readers on the English site can still open the
                // Georgian original (middleware.js switches their choice).
                href={lang === ORIGINAL ? `${postUrl(basePath, slug, lang)}?lang=ka` : postUrl(basePath, slug, lang)}
                hrefLang={lang.code}
                lang={lang.code}
                aria-current={isCurrent ? 'page' : undefined}
                prefetch={false}
                className={`inline-flex min-h-[36px] items-center rounded-full px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#474F7A] focus-visible:ring-offset-2 ${
                  isCurrent
                    ? 'pointer-events-none bg-[#474F7A] text-white'
                    : 'border border-[#AD88C6] bg-white text-[#474F7A] hover:bg-[#AD88C6] hover:text-white'
                }`}
              >
                {lang.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
