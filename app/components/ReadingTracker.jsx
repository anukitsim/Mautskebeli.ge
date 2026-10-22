'use client';

// app/components/ReadingTracker.jsx — counts one open of an article page.
//
// Renders nothing. When the page opens it sends "opened" to /api/reading,
// then small updates while the tab is visible (15 s, 45 s, 90 s, 3, 5, 10 min)
// and one last update when the reader leaves. Each update says how long the
// tab has been visible and how far through the text the reader got.
// If the ticket is missing (statistics off), it does nothing at all.
// Any error is swallowed: the tracker must never break the article page.

import { useEffect, useRef } from 'react';

const ENDPOINT = '/api/reading';
const MILESTONES = [15, 45, 90, 180, 300, 600];
// Stop adding time after 3 minutes with no scroll/touch/key/mouse at all
// (a tab left open on a desk is not someone reading).
const IDLE_LIMIT_MS = 3 * 60 * 1000;

function randomId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function Tracker({ ticket, contentSelector }) {
  // Kept in a ref so React's double effect run in development reuses the same ID.
  const openIdRef = useRef(null);
  if (!openIdRef.current) openIdRef.current = randomId();

  useEffect(() => {
    const openId = openIdRef.current;
    let visibleMs = 0;
    let lastTick = Date.now();
    let lastInput = Date.now();
    let maxScroll = 0;
    let sentSeconds = -1;
    let sentScroll = -1;
    let nextMilestone = 0;

    const measureScroll = () => {
      const el = document.querySelector(contentSelector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) return;
      const pct = Math.round(((window.innerHeight - rect.top) / rect.height) * 100);
      maxScroll = Math.max(maxScroll, Math.min(100, Math.max(0, pct)));
    };

    const send = (atExit) => {
      try {
        const seconds = Math.floor(visibleMs / 1000);
        if (seconds === sentSeconds && maxScroll === sentScroll) return;
        sentSeconds = seconds;
        sentScroll = maxScroll;
        const body = JSON.stringify({ ticket, openId, seconds, scroll: maxScroll });
        // When the page is closing, sendBeacon is the most likely to arrive.
        if (atExit && navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) {
          return;
        }
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
          credentials: 'same-origin',
        }).catch(() => {});
      } catch {}
    };

    const tick = () => {
      const now = Date.now();
      // Cap each step at 2 s, so a sleeping laptop doesn't add hours at once.
      const step = Math.min(now - lastTick, 2000);
      lastTick = now;
      if (document.visibilityState === 'visible' && now - lastInput < IDLE_LIMIT_MS) {
        visibleMs += step;
      }
      measureScroll();
      if (nextMilestone < MILESTONES.length && visibleMs / 1000 >= MILESTONES[nextMilestone]) {
        nextMilestone += 1;
        send(false);
      }
    };

    const onInput = () => {
      lastInput = Date.now();
    };
    const onScroll = () => {
      lastInput = Date.now();
      measureScroll();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') send(true);
      else lastTick = Date.now();
    };
    const onPageHide = () => send(true);

    measureScroll();
    send(false); // "opened"
    const timer = setInterval(tick, 1000);
    window.addEventListener('scroll', onScroll, { passive: true });
    for (const type of ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel']) {
      window.addEventListener(type, onInput, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', onScroll);
      for (const type of ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel']) {
        window.removeEventListener(type, onInput);
      }
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      send(false); // leaving to another page inside the site
    };
  }, [ticket, contentSelector]);

  return null;
}

export default function ReadingTracker({ ticket, contentSelector = '.article-content' }) {
  if (!ticket) return null;
  // A new ticket (a newly built page) is a new open, with a fresh ID.
  return <Tracker key={ticket} ticket={ticket} contentSelector={contentSelector} />;
}
