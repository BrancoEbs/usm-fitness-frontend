import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola cuando subes cambios
      includeAssets: ['favicon.svg'], // Usa tu logo actual
      manifest: {
        name: 'Gimnasio USM',
        short_name: 'Gym USM',
        description: 'Plataforma oficial de reservas del Gimnasio USM',
        theme_color: '#003057', // Azul USM para la barra del celular
        background_color: '#ffffff',
        display: 'standalone', // Esto oculta la barra del navegador de Chrome/Safari
        orientation: 'portrait', // La mantiene en vertical
        icons: [
          {
            src: 'favicon.svg', // Usa el SVG que ya tienes en la carpeta public
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})