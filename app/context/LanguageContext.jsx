'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ka'); // DEFAULT: Georgian
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Detect Safari browser (including iOS Safari)
  const isSafari = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafariBrowser = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isSafariBrowser || isIOS;
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
    
    // Safari: Clean up cache-busting parameters if present
    if (safari && (window.location.search.includes('_reload=') || window.location.search.includes('_t='))) {
      const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]_reload=\d+/, '').replace(/[?&]_t=\d+/, '').replace(/^\?$/, '').replace(/^&/, '?');
      window.history.replaceState(null, '', cleanUrl || window.location.pathname);
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
      
      // Safari: Clean up any residual translation DOM elements
      if (safari) {
        // Remove translated class from html element
        document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
        document.documentElement.removeAttribute('lang');
        document.documentElement.setAttribute('lang', 'ka');
        
        // Remove Google Translate injected elements
        const gtElements = document.querySelectorAll('.goog-te-spinner-pos, .goog-te-menu-frame, [id^="goog-gt-"]');
        gtElements.forEach(el => el.remove());
        
        console.log('🧹 Safari: Cleaned up translation DOM artifacts');
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
    style.id = 'google-translate-styles';
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
      
      /* ===== CRITICAL: PREVENT TRANSLATION FLICKERING ===== */
      
      /* When page is translated, ensure smooth rendering */
      html.translated-ltr,
      html.translated-rtl {
        /* Force GPU layer to prevent repaints */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      /* Keep translated font elements always visible and stable */
      html.translated-ltr font,
      html.translated-rtl font {
        display: inline !important;
        visibility: visible !important;
        opacity: 1 !important;
        vertical-align: baseline !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Smooth font rendering for translated content */
      html.translated-ltr *,
      html.translated-rtl * {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
      
      /* Hide Google's highlight and tooltip that causes flicker */
      .goog-text-highlight,
      #goog-gt-tt,
      .goog-te-balloon-frame {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      /* CRITICAL: Force all content containers to use GPU compositing */
      html.translated-ltr main,
      html.translated-ltr article,
      html.translated-ltr section,
      html.translated-ltr .article-content,
      html.translated-ltr [class*="article"],
      html.translated-rtl main,
      html.translated-rtl article,
      html.translated-rtl section,
      html.translated-rtl .article-content,
      html.translated-rtl [class*="article"] {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        will-change: transform;
        contain: layout style paint;
      }
      
      /* Prevent scroll-triggered re-translation flicker */
      html.translated-ltr p,
      html.translated-ltr h1,
      html.translated-ltr h2,
      html.translated-ltr h3,
      html.translated-ltr h4,
      html.translated-ltr h5,
      html.translated-ltr h6,
      html.translated-ltr span,
      html.translated-ltr li,
      html.translated-ltr a,
      html.translated-rtl p,
      html.translated-rtl h1,
      html.translated-rtl h2,
      html.translated-rtl h3,
      html.translated-rtl h4,
      html.translated-rtl h5,
      html.translated-rtl h6,
      html.translated-rtl span,
      html.translated-rtl li,
      html.translated-rtl a {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
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
    
    // Remove existing style if present (prevent duplicates)
    const existingStyle = document.getElementById('google-translate-styles');
    if (existingStyle) existingStyle.remove();
    
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
    
    // ===== TRANSLATION STABILIZATION =====
    // Prevent flickering during scroll by forcing GPU compositing
    let translationStabilized = false;
    let translationCheckInterval = null;
    
    const stabilizeTranslation = () => {
      const isTranslated = document.documentElement.classList.contains('translated-ltr') || 
                           document.documentElement.classList.contains('translated-rtl');
      
      if (isTranslated && !translationStabilized) {
        console.log('🔒 Stabilizing translation...');
        
        // Force GPU compositing on ALL text elements to prevent repaint flicker
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, li, a, div, td, th, label');
        textElements.forEach(el => {
          if (!el.style.transform) {
            el.style.transform = 'translateZ(0)';
            el.style.webkitTransform = 'translateZ(0)';
          }
        });
        
        // Force main containers to use compositing
        const containers = document.querySelectorAll('main, article, section, .article-content, [class*="article"]');
        containers.forEach(container => {
          container.style.transform = 'translateZ(0)';
          container.style.webkitTransform = 'translateZ(0)';
          container.style.willChange = 'transform';
          container.style.contain = 'layout style paint';
        });
        
        // Add body class for CSS hooks
        document.body.classList.add('translation-stable');
        
        translationStabilized = true;
        console.log('✅ Translation stabilized - GPU compositing enabled');
        
        // Clear the check interval once stabilized
        if (translationCheckInterval) {
          clearInterval(translationCheckInterval);
          translationCheckInterval = null;
        }
      }
    };
    
    // Check for translation repeatedly until it's detected and stabilized
    translationCheckInterval = setInterval(() => {
      if (!translationStabilized) {
        stabilizeTranslation();
      } else {
        clearInterval(translationCheckInterval);
      }
    }, 500);
    
    // Also run immediately and after delays
    stabilizeTranslation();
    setTimeout(stabilizeTranslation, 1000);
    setTimeout(stabilizeTranslation, 2000);
    setTimeout(stabilizeTranslation, 3000);
    
    // Scroll handler - just re-check stabilization, don't do heavy work
    const handleScroll = () => {
      if (!translationStabilized) {
        stabilizeTranslation();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      observer.disconnect();
      overlay.remove();
      window.removeEventListener('scroll', handleScroll);
      if (translationCheckInterval) {
        clearInterval(translationCheckInterval);
      }
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
          // Safari: Force reload with cache bypass
          window.location.href = window.location.href.split('#')[0] + '#googtrans(ka|en)';
          setTimeout(() => window.location.reload(), 100);
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
        const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = `${name}=; ${expiry}; path=/`;
        document.cookie = `${name}=; ${expiry}; path=/; SameSite=Lax`;
        document.cookie = `${name}=; ${expiry}; path=/; SameSite=None; Secure`;
        if (!hostname.includes('localhost')) {
          document.cookie = `${name}=; ${expiry}; domain=${hostname}; path=/`;
          document.cookie = `${name}=; ${expiry}; domain=.${hostname}; path=/`;
          document.cookie = `${name}=; ${expiry}; domain=${hostname}; path=/; SameSite=Lax`;
          document.cookie = `${name}=; ${expiry}; domain=.${hostname}; path=/; SameSite=Lax`;
        }
      };
      
      // Clear all Google Translate cookies
      clearCookie('googtrans');
      
      // Clear URL hash
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // Reload after smooth overlay transition
      setTimeout(() => {
        if (safari) {
          // Safari: Clean URL and force reload
          const cleanUrl = window.location.pathname;
          window.location.replace(cleanUrl + '?_t=' + Date.now());
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

