'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

/**
 * Masks the brief layout swap during client-side navigation (e.g. home → news)
 * so the user doesn't see the "purple glitch" when the sidebar disappears.
 * Not related to network — purely client-side transition.
 */
export default function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, 120);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] pointer-events-none"
      aria-hidden
      style={{
        background: '#F6F4F8',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.05s ease-out',
      }}
    />
  );
}
