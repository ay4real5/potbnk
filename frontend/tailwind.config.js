/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        bank: {
          dark:    '#012d2a',
          mid:     '#416461',
          accent:  '#00bfae',
          teal:    '#024f54',
          green:   '#2d6a4f',
          light:   '#e8f5ee',
          surface: '#f5f9f7',
          primary: '#012d2a',
        },
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

