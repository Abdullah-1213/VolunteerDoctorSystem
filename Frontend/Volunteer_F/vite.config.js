import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(),   // ✅ keep mkcert for HTTPS locally
  ],
  server: {
    https: true,  // ✅ force HTTPS
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '4776a1853700.ngrok-free.app', // ✅ allow ngrok domain
      'localhost',
    ],
  },
})
