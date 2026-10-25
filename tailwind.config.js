/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        valorant: {
          red: '#ff4655',
          dark: '#0f1923',
          surface: '#1b2733',
          border: '#2c3e50',
          text: '#ece8e1'
        },
        spotify: {
          green: '#1db954',
          hover: '#1ed760',
          dark: '#121212',
          surface: '#181818'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
