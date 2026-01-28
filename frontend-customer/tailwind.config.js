/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#809fff',
          500: '#4d77ff',
          600: '#3355ff',
          700: '#1a33ff',
          800: '#0011ff',
          900: '#0000e6',
          DEFAULT: '#4d77ff',
        },
        accent: {
          gold: '#FFD700',
          darkGold: '#B8860B',
          lightGold: '#FFEC8B',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
