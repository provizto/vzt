import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Mengaktifkan polyfill spesifik untuk Buffer dan proses Web3
      protocolImports: true,
    }),
  ],
  define: {
    // Menjamin globalThis terdefinisi di Vercel
    global: 'globalThis',
  }
})