import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Reads frontend/.env (see .env.example). API_PROXY_TARGET has no VITE_ prefix, so it stays out of the browser bundle.
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')

  return {
    server: {
      // Forward API calls to the FastAPI backend during development (no CORS needed).
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://127.0.0.1:8000'
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'AI Crop Guardian',
          short_name: 'CropGuard',
          description: 'Instant AI phytopathology engine for farmers',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone', // This hides the browser search bar so it looks like a native mobile app
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ]
  }
})
