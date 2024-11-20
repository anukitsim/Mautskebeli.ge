// app/free-column/[id]/LanguageDropdown.jsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LanguageDropdown = ({ id, currentLanguage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const router = useRouter();

  const availableLanguages = [
    { key: 'georgian', label: 'ქართული' },
    { key: 'language1', label: 'English' },
    { key: 'language2', label: 'Русский' },
  ];

  const handleLanguageNavigation = (language) => {
    if (language === 'georgian') {
      router.push(`/free-column/${id}`);
    } else if (language === 'language1') {
      router.push(`/free-column/${id}/ENG`);
    } else if (language === 'language2') {
      router.push(`/free-column/${id}/RU`);
    }
  };

  return (
    <div className="language-selector mt-4">
      <span
        className="cursor-pointer text-[#AD88C6] text-base font-bold"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        აირჩიე ენა
        <span className="ml-1 text-sm align-middle">
          {dropdownOpen ? '▼' : '▶'}
        </span>
      </span>
      {dropdownOpen && (
        <div className="flex gap-2 mt-2">
          {availableLanguages.map((language) => (
            <button
              key={language.key}
              onClick={() => handleLanguageNavigation(language.key)}
              disabled={language.key === currentLanguage}
              className={`px-4 py-2 rounded text-sm font-semibold ${
                language.key === currentLanguage
                  ? 'bg-gray-300 text-[#474F7A] cursor-not-allowed'
                  : 'bg-[#AD88C6] text-[#474F7A] hover:bg-[#AD88C6]'
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
