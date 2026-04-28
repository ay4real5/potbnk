/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          dark: '#0b3d2e',
          primary: '#0f5132',
          accent: '#22c55e',
          light: '#e6f4ea',
        }
      }
    },
  },
  plugins: [],
}

