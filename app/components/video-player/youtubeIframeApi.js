"use client";

// Every custom player on the site (NewsVideoPlayer, CustomYoutube) needs the
// YouTube IFrame API. Loading it used to be duplicated per-component: each one
// unconditionally injected its own <script> tag and overwrote
// window.onYouTubeIframeAPIReady on mount. That's a race even with a single
// player on the page, because Next's default React Strict Mode double-invokes
// effects in dev (mount -> cleanup -> mount), so the same component could inject
// the script twice and stomp its own callback mid-load.
//
// This module makes loading idempotent and shareable: every caller gets the
// same in-flight promise, the script tag is injected at most once, and any
// pre-existing onYouTubeIframeAPIReady callback (e.g. from a third-party embed
// elsewhere on the page) is chained rather than clobbered.
let apiPromise = null;

export function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadYouTubeIframeApi() called outside the browser"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") previousCallback();
      resolve(window.YT);
    };

    const alreadyInjected = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!alreadyInjected) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }
  });

  return apiPromise;
}
