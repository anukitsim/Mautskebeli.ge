// app/all-articles/[id]/RU/ScrollToTopButton.jsx

'use client';

import { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 200; // Adjusted for better UX
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 100;
      const bottomThreshold = documentHeight - (footerHeight + windowHeight * 2);

      if (scrollY > scrollThreshold && scrollY < bottomThreshold) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollButton) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-10 right-10 text-[#474F7A] w-[210px] h-[51px] rounded-[100px] inline-flex items-center justify-center gap-[10px]"
      style={{
        padding: '25px 32px 28px 32px',
        background: '#FECE27',
        boxShadow: '0 0 20px 5px rgba(254, 206, 39, 0.5)',
      }}
    >
      <span className="whitespace-nowrap">Вернуться к началу</span>
    </button>
  );
};

export default ScrollToTopButton;
