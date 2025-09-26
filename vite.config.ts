import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      esmExternals: true,
    },
  },
  optimizeDeps: {
    include: ['@selfxyz/core', '@selfxyz/qrcode', '@selfxyz/common'],
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
