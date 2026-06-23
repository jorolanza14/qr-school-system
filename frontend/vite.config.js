// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl'; // 1. ADD THIS IMPORT LINE HERE

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // 2. ADD THIS CONTROLLER HERE TO ENFORCE HTTPS PROTOCOLS
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'QR Code-Based School Management System',
        short_name: 'QRSchool',
        description: 'Integrated QR Code School Transaction Platform',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone', // This is what hides the mobile browser URL bar!
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Keeps your local network sharing active
    port: 5173
  }
});