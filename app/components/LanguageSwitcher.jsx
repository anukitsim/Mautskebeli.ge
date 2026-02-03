'use client';

import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const LanguageSwitcher = ({ variant = 'nav' }) => {
  const { language, changeLanguage, isTranslating } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate tooltip position when showing
  useEffect(() => {
    if (showTooltip && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showTooltip]);

  // Handle tooltip display - stays visible on hover
  const handleEngHover = () => {
    if (!isMobile) {
      setShowTooltip(true);
    }
  };

  const handleEngLeave = () => {
    if (!isMobile) {
      setShowTooltip(false);
    }
  };

  // Handle touch for mobile devices
  const handleEngTouch = () => {
    if (isMobile) {
      setShowTooltip(true);
      // Auto-hide after 2 seconds on mobile
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
    }
  };

  // Header variant (for white background)
  if (variant === 'header') {
    return (
      <div ref={buttonRef} className="flex items-center gap-0.5 sm:gap-1 bg-[#AD88C6]/10 rounded-full p-0.5 sm:p-1 relative notranslate min-w-[80px] sm:min-w-[100px]" translate="no">
        <button
          onClick={() => changeLanguage('ka')}
          disabled={isTranslating}
          className={`
            notranslate px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95 touch-manipulation
            ${language === 'ka' 
              ? 'bg-[#AD88C6] text-white shadow-md' 
              : 'text-[#474F7A] hover:bg-[#AD88C6]/20'
            }
            ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Switch to Georgian"
        >
          <span translate="no" className="notranslate">GEO</span>
        </button>
        <button
          onClick={() => changeLanguage('en')}
          onMouseEnter={handleEngHover}
          onMouseLeave={handleEngLeave}
          onTouchStart={handleEngTouch}
          disabled={isTranslating}
          className={`
            notranslate px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95 touch-manipulation
            ${language === 'en' 
              ? 'bg-[#AD88C6] text-white shadow-md' 
              : 'text-[#474F7A] hover:bg-[#AD88C6]/20'
            }
            ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Switch to English"
        >
          <span translate="no" className="notranslate">ENG</span>
        </button>
        
        {/* Tooltip - rendered via portal at body level */}
        {showTooltip && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed text-white px-3 py-2 rounded-lg
                       whitespace-nowrap pointer-events-none animate-fadeIn"
            style={{
              backgroundColor: 'rgb(71, 79, 122)',
              top: tooltipPosition.top,
              right: tooltipPosition.right,
              zIndex: 2147483647,
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex flex-col gap-0.5 text-center">
              <span className="font-semibold text-[11px]">Auto-generated Translation</span>
              <span className="text-[10px] opacity-75">Powered by Google Translate</span>
            </div>
            {/* Arrow pointing up */}
            <div 
              className="absolute -top-1.5 right-6 w-3 h-3 transform rotate-45"
              style={{ backgroundColor: 'rgb(71, 79, 122)' }}
            ></div>
          </div>,
          document.body
        )}
        {isTranslating && (
          <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 animate-fade-in">
            <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-[#AD88C6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Nav variant (for purple background) - default
  return (
    <div ref={buttonRef} className="flex items-center gap-0.5 sm:gap-1 bg-white/10 rounded-full p-0.5 sm:p-1 relative notranslate min-w-[80px] sm:min-w-[100px]" translate="no">
      <button
        onClick={() => changeLanguage('ka')}
        disabled={isTranslating}
        className={`
          notranslate px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold 
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95 touch-manipulation
          ${language === 'ka' 
            ? 'bg-white text-[#AD88C6] shadow-md' 
            : 'text-white hover:bg-white/20'
          }
          ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Switch to Georgian"
      >
        <span translate="no" className="notranslate">GEO</span>
      </button>
      <button
        onClick={() => changeLanguage('en')}
        onMouseEnter={handleEngHover}
        onMouseLeave={handleEngLeave}
        onTouchStart={handleEngTouch}
        disabled={isTranslating}
        className={`
          notranslate px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold 
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95 touch-manipulation
          ${language === 'en' 
            ? 'bg-white text-[#AD88C6] shadow-md' 
            : 'text-white hover:bg-white/20'
          }
          ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Switch to English"
      >
        <span translate="no" className="notranslate">ENG</span>
      </button>
      
      {/* Tooltip - rendered via portal at body level */}
      {showTooltip && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed text-white px-3 py-2 rounded-lg
                     whitespace-nowrap pointer-events-none animate-fadeIn"
          style={{
            backgroundColor: 'rgb(71, 79, 122)',
            top: tooltipPosition.top,
            right: tooltipPosition.right,
            zIndex: 2147483647,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex flex-col gap-0.5 text-center">
            <span className="font-semibold text-[11px]">Auto-generated Translation</span>
            <span className="text-[10px] opacity-75">Powered by Google Translate</span>
          </div>
          {/* Arrow pointing up */}
          <div 
            className="absolute -top-1.5 right-6 w-3 h-3 transform rotate-45"
            style={{ backgroundColor: 'rgb(71, 79, 122)' }}
          ></div>
        </div>,
        document.body
      )}
      {isTranslating && (
        <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 animate-fade-in">
          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

