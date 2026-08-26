/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'lilac-20': '#E0DBE8',
        // Homepage redesign 2026 — "Disciplined" direction (deep violet, near-black, acid accent rationed to one use).
        // Scoped under `mau-` so it doesn't collide with existing site colors while other pages are un-redesigned.
        'mau-paper': '#1A1219',
        'mau-surface': '#241A28',
        'mau-ink': '#F2ECEA',
        'mau-ink-soft': '#ABA0A6',
        'mau-line': '#362A38',
        'mau-line-strong': '#4A3A4C',
        'mau-violet': '#B872C9',
        'mau-violet-deep': '#3D2145',
        'mau-acid': '#D6F23A',
      },
      boxShadow: {
        md: '4px 4px 12px rgba(93, 78, 116, 0.14)',
      },
      backgroundColor: {
        'lilac-20/20': 'rgba(224, 219, 232, 0.20)',
      },
      fontFamily: {
        'alk-tall-mtavruli': ['"ALK Tall Mtavruli"', 'sans-serif'],
        'noto-sans-georgian': ['var(--font-noto-sans-georgian)', 'sans-serif'],
        'firago': ['var(--font-firago)', 'sans-serif'],
      },
      lineHeight: {
        'extra-loose': '2.5',  // Custom line height
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'), // Added Line Clamp Plugin
  ],
};
