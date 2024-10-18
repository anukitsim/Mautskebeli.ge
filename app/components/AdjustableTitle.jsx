// components/AdjustableTitle.jsx

import React, { useRef, useState, useEffect } from 'react';

const AdjustableTitle = ({
  text,
  initialFontSize = 72, // Starting font size
  minFontSize = 50,     // Minimum font size to prevent it from becoming too small
  className = '',
}) => {
  const titleRef = useRef(null);
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    const adjustFontSize = () => {
      const titleElement = titleRef.current;
      if (titleElement) {
        // Reset font size to initial
        setFontSize(initialFontSize);
        titleElement.style.fontSize = `${initialFontSize}px`;

        // Measure if the text is overflowing
        if (titleElement.scrollWidth > titleElement.clientWidth) {
          let newFontSize = initialFontSize;
          while (titleElement.scrollWidth > titleElement.clientWidth && newFontSize > minFontSize) {
            newFontSize -= 1;
            titleElement.style.fontSize = `${newFontSize}px`;
          }
          setFontSize(newFontSize);
        }
      }
    };

    adjustFontSize();

    // Re-adjust on window resize
    window.addEventListener('resize', adjustFontSize);
    return () => {
      window.removeEventListener('resize', adjustFontSize);
    };
  }, [text, initialFontSize, minFontSize]);

  return (
    <h2
      ref={titleRef}
      className={className}
      style={{
        fontSize: `${fontSize}px`,
        transition: 'font-size 0.2s ease-in-out',
        whiteSpace: 'nowrap', // Prevent wrapping
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      title={text} // Tooltip for truncated text
    >
      {text}
    </h2>
  );
};

export default AdjustableTitle;
