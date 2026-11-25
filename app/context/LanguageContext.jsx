'use client';

// The reader's language (ka / en) for browser components.
//
// The language comes from the address: /en/... is English (see middleware.js).
// app/layout.js reads it on the server and passes it in as initialLanguage,
// so the server HTML and the browser agree (no hydration mismatch, no flicker).
//
// This replaced the Google Translate widget, which rewrote the page in the
// browser, fought with React and needed reloads + cookies to switch.

import { createContext, useCallback, useContext, useMemo } from 'react';
import { LANG_COOKIE } from '@/utils/i18n/config';
import { localizePath } from '@/utils/i18n/paths';
import { translateUi } from '@/utils/i18n/dictionary';

const LanguageContext = createContext(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

// On English pages, browser components that read WordPress get the English
// version instead: their GET requests to the public WordPress API go to
// /api/en/wp/... (same data, texts translated on the server). Installed
// while rendering, so it is in place before any component starts loading.
// Only GET reads of wp/v2 and custom/v1 are changed; everything else
// (donations, subscriptions, other sites) goes out untouched.
const WP_READ = /^https:\/\/mautskebeli\.wpenginepowered\.com\/wp-json\/((?:wp\/v2|custom\/v1)\/[^#]*)$/;
function installEnglishWordPress(language) {
  if (typeof window === 'undefined' || language !== 'en' || window.__mauEnglishFetch) return;
  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
    const method = (init?.method || (input && typeof input === 'object' && input.method) || 'GET').toUpperCase();
    const match = method === 'GET' && typeof url === 'string' ? url.match(WP_READ) : null;
    if (match) return original(`/api/en/wp/${match[1]}`, init);
    return original(input, init);
  };
  window.__mauEnglishFetch = true;
}

export function LanguageProvider({ children, initialLanguage = 'ka' }) {
  const parent = useContext(LanguageContext);

  const language = initialLanguage === 'en' ? 'en' : 'ka';
  installEnglishWordPress(parent ? null : language);

  const changeLanguage = useCallback((lang) => {
    if (typeof window === 'undefined' || (lang !== 'ka' && lang !== 'en')) return;
    // Remember the choice, then open the same page in that language.
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
    // The old Google Translate widget's cookie is no longer used.
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const { pathname, search, hash } = window.location;
    const target = localizePath(pathname, lang) + search + hash;
    if (lang === language && target === pathname + search + hash) return;
    window.location.assign(target);
  }, [language]);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    isTranslating: false,
    // t('ქართული ტექსტი') → English on English pages.
    t: (ka) => translateUi(language, ka),
    // localize('/news/x') → '/en/news/x' on English pages.
    localize: (path) => localizePath(path, language),
  }), [language, changeLanguage]);

  // Some section layouts still wrap their page in a second LanguageProvider.
  // The one from app/layout.js already knows the language, so step aside.
  if (parent) return children;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

const FALLBACK = {
  language: 'ka',
  changeLanguage: () => {},
  isTranslating: false,
  t: (ka) => ka,
  localize: (path) => path,
};

export function useLanguage() {
  return useContext(LanguageContext) || FALLBACK;
}
