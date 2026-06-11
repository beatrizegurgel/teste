import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O frontend conversa apenas com o gateway. Todas as chamadas /api/* são
// encaminhadas para http://localhost:4000 (API Gateway), evitando CORS em dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.GATEWAY_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
