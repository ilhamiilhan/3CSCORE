// vite.config.js (GÜNCELLENMİŞ PWA ÇÖZÜMÜ)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Eklentiyi import et

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // PWA Eklentisini buraya ekleyin
    VitePWA({
      // Bu ayar, 'index.html'deki eski script'in yerine geçer
      // ve kendini otomatik güncelleyen bir service worker oluşturur.
      registerType: 'autoUpdate', 
      
      // index.html dosyanızdaki ayarları buraya taşıyoruz
      manifest: {
        name: '3C SCORE',
        short_name: '3C SCORE',
        description: '3C Bilardo Skor Takip Uygulaması',
        theme_color: '#2563eb', // index.html'den
        icons: [
          {
            src: 'icon-192.png', // index.html'den
            sizes: '192x192',
            type: 'image/png'
          }
          // Not: vite-plugin-pwa genellikle 512x512 ikonu da ister.
          // 'public' klasörünüze 'icon-512.png' eklemeniz iyi olur.
          // {
          //   src: 'icon-512.png',
          //   sizes: '512x512',
          //   type: 'image/png'
          // }
        ]
      }
    })
  ]
})