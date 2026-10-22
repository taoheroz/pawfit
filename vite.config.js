import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// On GitHub Pages the app lives at https://<user>.github.io/pawfit/
const base = process.env.BASE_PATH || '/pawfit/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'PawFit',
        short_name: 'PawFit',
        description: 'ดูแลสุขภาพทีละนิด นับแคล โปรตีน ออกกำลัง พร้อมน้องแมวที่โตไปกับเธอ',
        lang: 'th',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F1F4EC',
        theme_color: '#2D7A52',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/, handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } }
        ]
      }
    })
  ]
});
