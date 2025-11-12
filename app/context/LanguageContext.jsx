'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ka'); // DEFAULT: Georgian
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Detect Safari browser
  const isSafari = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
  };

  // Georgian as default on RELOAD, but persist during NAVIGATION (sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const safari = isSafari();
    const hostname = window.location.hostname.replace('www.', '');
    
    // Check sessionStorage for language (persists during navigation, not after reload)
    const sessionLang = sessionStorage.getItem('siteLanguage');
    
    // Safari: Check for force Georgian flag from previous navigation
    const forceGeorgian = sessionStorage.getItem('forceGeorgian');
    
    if (safari && forceGeorgian === 'true') {
      console.log('🔄 Safari: Forcing Georgian mode from sessionStorage');
      sessionStorage.removeItem('forceGeorgian');
      sessionStorage.removeItem('siteLanguage'); // Clear session language
      setLanguage('ka');
      
      // Aggressively clear all translation artifacts
      const clearCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${hostname}; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure`;
      };
      
      clearCookie('googtrans');
      
      // Remove any translation artifacts from the page
      if (window.location.hash.includes('googtrans')) {
        window.location.hash = '';
      }
      
      // Clean up cache-busting parameter from URL
      if (window.location.search.includes('_reload=')) {
        const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]_reload=\d+/, '').replace(/^&/, '?');
        window.history.replaceState(null, '', cleanUrl);
        console.log('🧹 Safari: Cleaned cache-busting parameter');
      }
      
      return; // Exit early, don't check other conditions
    }
    
    // Safari: Clean up cache-busting parameter if present (for other scenarios)
    if (safari && window.location.search.includes('_reload=')) {
      const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]_reload=\d+/, '').replace(/^&/, '?');
      window.history.replaceState(null, '', cleanUrl);
    }
    
    // ONLY sessionStorage matters (navigation within session)
    // Ignore cookies on initial load - they're stale from previous sessions
    if (sessionLang === 'en') {
      // User is actively navigating in English mode within this session
      setLanguage('en');
      console.log('✅ English mode (navigating within session)', safari ? '(Safari)' : '');
      
      // Set cookie to enable translation
      const cookieValue = 'googtrans=/ka/en';
      const cookieAttrs = `path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `${cookieValue}; ${cookieAttrs}`;
      if (!hostname.includes('localhost')) {
        document.cookie = `${cookieValue}; ${cookieAttrs}; domain=${hostname}`;
        document.cookie = `${cookieValue}; ${cookieAttrs}; domain=.${hostname}`;
      }
    } else {
      // DEFAULT: Georgian (fresh load or user clicked GEO)
      setLanguage('ka');
      sessionStorage.setItem('siteLanguage', 'ka');
      console.log('✅ Default: Georgian mode', safari ? '(Safari)' : '');
      
      // Aggressively clear ALL translation cookies (Safari-compatible)
      const clearCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
        if (!hostname.includes('localhost')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}; path=/; SameSite=Lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${hostname}; path=/; SameSite=Lax`;
        }
      };
      
      clearCookie('googtrans');
      
      // Remove translation hash from URL
      if (window.location.hash.includes('googtrans')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  // Initialize Google Translate (Safari-compatible)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const safari = isSafari();

    // Initialize Google Translate Widget
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ka',
          includedLanguages: 'en,ka',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true, // Safari compatibility
        },
        'google_translate_element'
      );
      
      // Mark as loaded after initialization (Safari needs more time)
      setTimeout(() => {
        setIsGoogleLoaded(true);
        console.log('Google Translate loaded', safari ? '(Safari)' : '');
      }, safari ? 1500 : 1000);
    };

    // Add Google Translate script (HTTPS for Safari)
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true; // Safari compatibility
      document.body.appendChild(script);
    }

    // SMART Google UI hiding - only hide branding, keep functional elements
    const style = document.createElement('style');
    style.innerHTML = `
      /* Hide ONLY Google branding (keep translation functional) */
      .goog-te-banner-frame,
      .goog-te-balloon-frame,
      .goog-logo-link,
      body > .skiptranslate:first-child,
      #goog-gt-tt,
      .goog-te-gadget {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Keep translation element hidden but functional */
      #google_translate_element {
        position: absolute !important;
        left: -9999px !important;
        opacity: 0 !important;
      }
      
      /* Remove Google's top spacing */
      body {
        top: 0 !important;
        position: static !important;
      }
      
      /* SMOOTH full-page overlay transition (mobile-optimized) */
      #page-transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        /* Mobile: Use dvh for better viewport coverage */
        height: 100dvh;
        background: white;
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease-in-out;
        /* Prevent any scrolling during transition */
        overscroll-behavior: contain;
      }
      
      #page-transition-overlay.active {
        opacity: 1;
        pointer-events: all;
      }
      
      /* Smooth fade-in animation */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    // Create smooth transition overlay
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Only hide annoying popups with MutationObserver (don't block translation)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Only remove banner/popup elements, NOT translation elements
            if (
              node.classList?.contains('goog-te-banner-frame') ||
              node.classList?.contains('goog-te-balloon-frame') ||
              (node.tagName === 'IFRAME' && node.className?.includes('goog-te-banner'))
            ) {
              console.log('Hiding Google banner:', node);
              node.style.display = 'none';
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false // Only watch direct children
    });

    // Cleanup
    return () => {
      observer.disconnect();
      overlay.remove();
    };
  }, []);

  // Function to change language with SMOOTH overlay transition (Safari-compatible)
  const changeLanguage = (lang) => {
    if (lang === language) return; // Already in this language

    console.log('🌐 Changing language to:', lang);
    setIsTranslating(true);
    setLanguage(lang);
    
    const safari = isSafari();
    const hostname = window.location.hostname.replace('www.', '');
    
    // Trigger smooth overlay fade
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }

    if (lang === 'en') {
      // Translate to English
      console.log('✅ Setting English translation...', safari ? '(Safari)' : '');
      
      // Use sessionStorage (persists during navigation, not after reload)
      sessionStorage.setItem('siteLanguage', 'en');
      
      // Set Google Translate cookies (Safari-compatible with SameSite)
      const cookieValue = 'googtrans=/ka/en';
      const cookieAttrs = `path=/; max-age=31536000; SameSite=Lax`;
      
      document.cookie = `${cookieValue}; ${cookieAttrs}`;
      
      // Also set with domain for non-localhost
      if (!hostname.includes('localhost')) {
        document.cookie = `${cookieValue}; ${cookieAttrs}; domain=${hostname}`;
        document.cookie = `${cookieValue}; ${cookieAttrs}; domain=.${hostname}`;
      }
      
      // Reload after smooth overlay transition
      setTimeout(() => {
        if (safari) {
          // Safari: Use window.location.replace for better cookie handling
          window.location.replace(window.location.href);
        } else {
          window.location.reload();
        }
      }, 400);
    } else {
      // Back to Georgian - clear everything and reload
      console.log('✅ Returning to Georgian...', safari ? '(Safari)' : '');
      
      // Clear sessionStorage (back to default)
      sessionStorage.removeItem('siteLanguage');
      
      // Safari: Set force Georgian flag for next page load
      if (safari) {
        sessionStorage.setItem('forceGeorgian', 'true');
        console.log('🔐 Safari: Set forceGeorgian flag');
      }
      
      // Aggressive Safari-compatible cookie clearing
      const clearCookie = (name) => {
        // Clear with multiple variations to ensure complete removal
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure`;
        if (!hostname.includes('localhost')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}; path=/; SameSite=Lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${hostname}; path=/; SameSite=Lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}; path=/; SameSite=None; Secure`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${hostname}; path=/; SameSite=None; Secure`;
        }
      };
      
      // Clear all Google Translate cookies
      clearCookie('googtrans');
      
      // Clear URL hash
      if (window.location.hash.includes('googtrans')) {
        window.location.hash = '';
      }
      
      // Reload after smooth overlay transition
      setTimeout(() => {
        if (safari) {
          // Safari: Use cache-busting reload to ensure fresh page
          const cacheBuster = `_reload=${Date.now()}`;
          const url = window.location.pathname + (window.location.search ? window.location.search + '&' + cacheBuster : '?' + cacheBuster);
          console.log('🔄 Safari: Reloading with cache buster:', url);
          window.location.replace(url);
        } else {
          window.location.href = window.location.pathname;
        }
      }, 400);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isTranslating }}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

