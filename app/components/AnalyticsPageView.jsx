'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPageView() {
  const pathname     = usePathname();       // e.g. /news/123
  const searchParams = useSearchParams();   // e.g. ?utm_source=…

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams}` : '');

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href, // optional but nice
    });
  }, [pathname, searchParams]);

  return null; // renders nothing
}
