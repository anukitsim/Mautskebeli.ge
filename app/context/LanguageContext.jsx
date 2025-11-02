'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ka'); // DEFAULT: Georgian
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Georgian as default - check cookies on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for English translation cookie FIRST
    const cookies = document.cookie.split(';');
    let hasEnglishCookie = false;
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans' && value === '/ka/en') {
        hasEnglishCookie = true;
        setLanguage('en');
        console.log('✅ English mode detected from cookie');
        break;
      }
    }
    
    // If NO English cookie, force Georgian and clear stale cookies
    if (!hasEnglishCookie) {
      setLanguage('ka');
      console.log('✅ Default: Georgian mode');
      
      // Clear any stale translation cookies
      const hostname = window.location.hostname.replace('www.', '');
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}; path=/`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${hostname}; path=/`;
      
      // Remove translation hash from URL
      if (window.location.hash.includes('googtrans')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  // Initialize Google Translate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Google Translate Widget
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ka',
          includedLanguages: 'en,ka',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
      
      // Mark as loaded after initialization
      setTimeout(() => {
        setIsGoogleLoaded(true);
        console.log('Google Translate loaded');
      }, 1000);
    };

    // Add Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
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
      
      /* SMOOTH full-page overlay transition */
      #page-transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease-in-out;
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

  // Function to change language with SMOOTH overlay transition
  const changeLanguage = (lang) => {
    if (lang === language) return; // Already in this language

    console.log('🌐 Changing language to:', lang);
    setIsTranslating(true);
    setLanguage(lang);
    
    // Trigger smooth overlay fade
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }

    if (lang === 'en') {
      // Translate to English using cookie method
      console.log('✅ Setting English translation...');
      
      // Set Google Translate cookies
      document.cookie = 'googtrans=/ka/en; path=/';
      document.cookie = 'googtrans=/ka/en; domain=' + window.location.hostname.replace('www.', '') + '; path=/';
      
      // Reload after smooth overlay transition
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      // Back to Georgian - clear everything and reload
      console.log('✅ Returning to Georgian...');
      localStorage.removeItem('siteLanguage');
      
      // Clear all cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=" + window.location.hostname.replace('www.', '') + ";path=/";
      }
      
      // Reload after smooth overlay transition
      setTimeout(() => {
        window.location.href = window.location.pathname;
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

