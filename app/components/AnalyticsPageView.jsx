'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPageView() {
  const pathname = usePathname();           // /news/123 etc.

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href, // optional
    });
  }, [pathname]);

  return null; // renders nothing
}
