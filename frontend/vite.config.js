import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Permite importar com "@/api/client" em vez de "../../api/client"
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: { port: 5173 },
})
