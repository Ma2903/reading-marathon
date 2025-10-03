// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Garante que o servidor seja acessível externamente
    port: 5173, // A porta que o Vite vai usar dentro do container
    strictPort: true,
    watch: {
      // Necessário para o Hot Reload funcionar corretamente no Docker
      usePolling: true,
    },
    hmr: {
      // Diz ao cliente para se conectar na porta exposta no host
      clientPort: 3000,
    },
  },
})