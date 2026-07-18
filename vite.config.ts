import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase-vendor';
          if (id.includes('lucide-react')) return 'icons-vendor';
          return undefined;
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CD Digital - Gestao de Prontidao Operacional',
        short_name: 'CD Digital',
        description: 'PWA para passagem de servico, escalas, viaturas e pendencias.',
        theme_color: '#16181C',
        background_color: '#16181C',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
