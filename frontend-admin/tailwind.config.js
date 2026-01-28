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
        admin: {
          sidebar: '#0f172a',
          bg: '#f8fafc',
          primary: '#0ea5e9',
          secondary: '#64748b',
          accent: '#10b981',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
