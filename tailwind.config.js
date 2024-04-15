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
      },
      boxShadow: {
        md: '4px 4px 12px rgba(93, 78, 116, 0.14)',
      },
      backgroundColor: {
        'lilac-20/20': 'rgba(224, 219, 232, 0.20)',
      }
    },
    
  },
  plugins: [],
};
