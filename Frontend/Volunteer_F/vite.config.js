import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(),
  ],
  server: {
    https: false,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'scaldic-shunnable-kiera.ngrok-free.dev',
      '127.0.0.1:8000',
      'localhost',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // put all node_modules into vendor chunk
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 2000 // optional, increase warning limit if needed
  }
})
