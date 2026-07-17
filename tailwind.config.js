/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Passagem 360 design tokens (mockups)
        primary: '#C8102E',
        primarySoft: '#E2536A',
        charcoal: '#16181C',
        charcoalSoft: '#1F2228',
        surface: '#F4F3F1',
        line: '#D9DBDE',
        ink: '#16181C',
        // Legacy palette (paginas antigas) - preservado
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
      borderRadius: {
        lg: '8px'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(0, 0, 0, 0.35)',
        card: '0 2px 6px rgba(0, 0, 0, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
