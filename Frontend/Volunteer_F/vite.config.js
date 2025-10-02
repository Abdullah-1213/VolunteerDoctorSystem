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
    strictPort: true,
    allowedHosts: [
      '2efd97cb6034.ngrok-free.app', // ✅ allow ngrok domain
      '127.0.0.1:8000',
      'localhost',
    ],
  },
})
