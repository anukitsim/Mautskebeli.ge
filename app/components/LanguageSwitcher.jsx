'use client';

import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

const LanguageSwitcher = ({ variant = 'nav' }) => {
  const { language, changeLanguage, isTranslating } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle tooltip display - stays visible on hover
  const handleEngHover = () => {
    setShowTooltip(true);
  };

  const handleEngLeave = () => {
    setShowTooltip(false);
  };

  // Header variant (for white background)
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1 bg-[#AD88C6]/10 rounded-full p-1 relative notranslate" translate="no">
        <button
          onClick={() => changeLanguage('ka')}
          disabled={isTranslating}
          className={`
            notranslate px-3 py-1 rounded-full text-xs font-semibold 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95
            ${language === 'ka' 
              ? 'bg-[#AD88C6] text-white shadow-md' 
              : 'text-[#474F7A] hover:bg-[#AD88C6]/20'
            }
            ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          aria-label="Switch to Georgian"
        >
          <span translate="no" className="notranslate">GEO</span>
        </button>
        <button
          onClick={() => changeLanguage('en')}
          onMouseEnter={handleEngHover}
          onMouseLeave={handleEngLeave}
          disabled={isTranslating}
          className={`
            notranslate px-3 py-1 rounded-full text-xs font-semibold 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95
            ${language === 'en' 
              ? 'bg-[#AD88C6] text-white shadow-md' 
              : 'text-[#474F7A] hover:bg-[#AD88C6]/20'
            }
            ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          aria-label="Switch to English"
        >
          <span translate="no" className="notranslate">ENG</span>
        </button>
        
        {/* Tooltip */}
        {showTooltip && (
          <div 
            className={`
              absolute top-full mt-2 right-0 
              bg-[#474F7A] text-white text-xs 
              px-3 py-2 rounded-lg shadow-lg
              whitespace-nowrap z-50
              transition-opacity duration-300
              ${showTooltip ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Auto-generated Translation</span>
              <span className="text-[10px] opacity-80">Powered by Google Translate</span>
            </div>
            {/* Arrow */}
            <div 
              className="absolute -top-1 right-4 w-2 h-2 bg-[#474F7A] transform rotate-45"
            ></div>
          </div>
        )}
        {isTranslating && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 animate-fade-in">
            <svg className="animate-spin h-4 w-4 text-[#AD88C6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 relative notranslate" translate="no">
      <button
        onClick={() => changeLanguage('ka')}
        disabled={isTranslating}
        className={`
          notranslate px-3 py-1 rounded-full text-xs font-semibold 
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95
          ${language === 'ka' 
            ? 'bg-white text-[#AD88C6] shadow-md' 
            : 'text-white hover:bg-white/20'
          }
          ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        aria-label="Switch to Georgian"
      >
        <span translate="no" className="notranslate">GEO</span>
      </button>
      <button
        onClick={() => changeLanguage('en')}
        onMouseEnter={handleEngHover}
        onMouseLeave={handleEngLeave}
        disabled={isTranslating}
        className={`
          notranslate px-3 py-1 rounded-full text-xs font-semibold 
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95
          ${language === 'en' 
            ? 'bg-white text-[#AD88C6] shadow-md' 
            : 'text-white hover:bg-white/20'
          }
          ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        aria-label="Switch to English"
      >
        <span translate="no" className="notranslate">ENG</span>
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className={`
            absolute top-full mt-2 right-0 
            bg-[#474F7A] text-white text-xs 
            px-3 py-2 rounded-lg shadow-lg
            whitespace-nowrap z-50
            transition-opacity duration-300
            ${showTooltip ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Auto-generated Translation</span>
            <span className="text-[10px] opacity-80">Powered by Google Translate</span>
          </div>
          {/* Arrow */}
          <div 
            className="absolute -top-1 right-4 w-2 h-2 bg-[#474F7A] transform rotate-45"
          ></div>
        </div>
      )}
      {isTranslating && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 animate-fade-in">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

