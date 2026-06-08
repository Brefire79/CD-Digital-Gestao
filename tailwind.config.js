/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        operacional: {
          bg: '#0b1120',
          panel: '#111827',
          panelSoft: '#172033',
          line: '#263244',
          accent: '#f5c542',
          fire: '#c81e1e',
          ok: '#19b37b'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};
